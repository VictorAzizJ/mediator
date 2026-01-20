import sqlite3
import os
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime


DB_PATH = os.path.join(os.path.dirname(__file__), 'transcripts.db')


def get_db_connection():
    """Get a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Initialize the database and create tables if they don't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create speakers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS speakers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    ''')
    
    # Create meeting_transcripts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS meeting_transcripts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create transcript_messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transcript_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_transcript_id INTEGER NOT NULL,
            speaker_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (meeting_transcript_id) REFERENCES meeting_transcripts(id),
            FOREIGN KEY (speaker_id) REFERENCES speakers(id)
        )
    ''')
    
    # Create transcript_message_tags table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transcript_message_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transcript_message_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            sub_category TEXT,
            label TEXT,
            score REAL,
            FOREIGN KEY (transcript_message_id) REFERENCES transcript_messages(id)
        )
    ''')
    
    # Create indexes for better query performance
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_tags_category ON transcript_message_tags(category)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_tags_sub_category ON transcript_message_tags(sub_category)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_messages_transcript ON transcript_messages(meeting_transcript_id)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_messages_speaker ON transcript_messages(speaker_id)
    ''')
    
    conn.commit()
    conn.close()


def get_or_create_speaker(name: str) -> int:
    """Get or create a speaker by name. Returns speaker ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Try to get existing speaker
    cursor.execute('SELECT id FROM speakers WHERE name = ?', (name,))
    row = cursor.fetchone()
    
    if row:
        speaker_id = row['id']
    else:
        # Create new speaker
        cursor.execute('INSERT INTO speakers (name) VALUES (?)', (name,))
        speaker_id = cursor.lastrowid
        conn.commit()
    
    conn.close()
    return speaker_id


def create_meeting_transcript(name: str, date: Optional[str] = None) -> int:
    """Create a new meeting transcript. Returns transcript ID."""
    if date is None:
        date = datetime.now().isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO meeting_transcripts (name, date) VALUES (?, ?)',
        (name, date)
    )
    transcript_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return transcript_id


def create_transcript_message(
    meeting_transcript_id: int,
    speaker_id: int,
    text: str
) -> int:
    """Create a new transcript message. Returns message ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        '''INSERT INTO transcript_messages 
           (meeting_transcript_id, speaker_id, text) 
           VALUES (?, ?, ?)''',
        (meeting_transcript_id, speaker_id, text)
    )
    message_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return message_id


def create_transcript_message_tag(
    transcript_message_id: int,
    category: str,
    sub_category: Optional[str] = None,
    label: Optional[str] = None,
    score: Optional[float] = None
) -> int:
    """Create a tag for a transcript message. Returns tag ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        '''INSERT INTO transcript_message_tags 
           (transcript_message_id, category, sub_category, label, score) 
           VALUES (?, ?, ?, ?, ?)''',
        (transcript_message_id, category, sub_category, label, score)
    )
    tag_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return tag_id


def get_all_speakers() -> List[Dict[str, Any]]:
    """Get all speakers."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, name FROM speakers ORDER BY name')
    rows = cursor.fetchall()
    
    conn.close()
    return [{'id': row['id'], 'name': row['name']} for row in rows]


def get_all_transcripts() -> List[Dict[str, Any]]:
    """Get all meeting transcripts."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, name, date FROM meeting_transcripts ORDER BY date DESC')
    rows = cursor.fetchall()
    
    conn.close()
    return [
        {'id': row['id'], 'name': row['name'], 'date': row['date']}
        for row in rows
    ]


def get_average_scores(
    category: str,
    speaker_id: Optional[int] = None,
    meeting_transcript_id: Optional[int] = None
) -> Dict[str, float]:
    """Get average scores for a category, optionally filtered by speaker or transcript."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT 
            sub_category,
            AVG(score) as avg_score
        FROM transcript_message_tags tmt
        INNER JOIN transcript_messages tm ON tmt.transcript_message_id = tm.id
        WHERE tmt.category = ?
    '''
    params = [category]
    
    if speaker_id is not None:
        query += ' AND tm.speaker_id = ?'
        params.append(speaker_id)
    
    if meeting_transcript_id is not None:
        query += ' AND tm.meeting_transcript_id = ?'
        params.append(meeting_transcript_id)
    
    query += ' AND tmt.score IS NOT NULL GROUP BY sub_category'
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    conn.close()
    return {row['sub_category'] or 'overall': round(row['avg_score'], 2) for row in rows}


def get_label_counts(
    category: str,
    sub_category: Optional[str] = None,
    speaker_id: Optional[int] = None,
    meeting_transcript_id: Optional[int] = None
) -> Dict[str, int]:
    """Get label frequency counts for a category/sub_category."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT 
            tmt.label,
            COUNT(*) as count
        FROM transcript_message_tags tmt
        INNER JOIN transcript_messages tm ON tmt.transcript_message_id = tm.id
        WHERE tmt.category = ? AND tmt.label IS NOT NULL
    '''
    params = [category]
    
    if sub_category is not None:
        query += ' AND tmt.sub_category = ?'
        params.append(sub_category)
    
    if speaker_id is not None:
        query += ' AND tm.speaker_id = ?'
        params.append(speaker_id)
    
    if meeting_transcript_id is not None:
        query += ' AND tm.meeting_transcript_id = ?'
        params.append(meeting_transcript_id)
    
    query += ' GROUP BY tmt.label'
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    conn.close()
    return {row['label']: row['count'] for row in rows}


def get_pie_chart_data(
    category: str,
    sub_category: Optional[str] = None,
    speaker_id: Optional[int] = None,
    meeting_transcript_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """Get data formatted for pie charts."""
    label_counts = get_label_counts(
        category, sub_category, speaker_id, meeting_transcript_id
    )
    
    total = sum(label_counts.values())
    if total == 0:
        return []
    
    return [
        {
            'label': label,
            'count': count,
            'percentage': round((count / total) * 100, 1)
        }
        for label, count in label_counts.items()
    ]


def get_subcategory_adherence_counts(
    category: str,
    sub_category: str,
    speaker_id: Optional[int] = None,
    meeting_transcript_id: Optional[int] = None
) -> Dict[str, int]:
    """Get adherence counts for a specific sub_category (adhered, did_not_adhere, not_applicable)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT 
            tmt.label,
            COUNT(*) as count
        FROM transcript_message_tags tmt
        INNER JOIN transcript_messages tm ON tmt.transcript_message_id = tm.id
        WHERE tmt.category = ? AND tmt.sub_category = ? AND tmt.label IS NOT NULL
    '''
    params = [category, sub_category]
    
    if speaker_id is not None:
        query += ' AND tm.speaker_id = ?'
        params.append(speaker_id)
    
    if meeting_transcript_id is not None:
        query += ' AND tm.meeting_transcript_id = ?'
        params.append(meeting_transcript_id)
    
    query += ' GROUP BY tmt.label'
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    conn.close()
    return {row['label']: row['count'] for row in rows}


# Initialize database on import
init_database()
