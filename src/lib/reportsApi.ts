const API_BASE_URL = 'http://localhost:8000/api/reports';

export interface Speaker {
  id: number;
  name: string;
}

export interface Transcript {
  id: number;
  name: string;
  date: string;
}

export interface PieChartDataPoint {
  label: string;
  count: number;
  percentage: number;
}

export interface MetricsResponse {
  averages: {
    [category: string]: {
      [subCategory: string]: number;
    };
  };
  label_counts: {
    [category: string]: {
      [subCategory: string]: {
        [label: string]: number;
      };
    };
  };
}

export async function fetchSpeakers(): Promise<Speaker[]> {
  const response = await fetch(`${API_BASE_URL}/speakers`);
  if (!response.ok) {
    throw new Error('Failed to fetch speakers');
  }
  return response.json();
}

export async function fetchTranscripts(): Promise<Transcript[]> {
  const response = await fetch(`${API_BASE_URL}/transcripts`);
  if (!response.ok) {
    throw new Error('Failed to fetch transcripts');
  }
  return response.json();
}

export async function fetchCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

export async function fetchMetrics(
  category: string,
  speakerId?: number,
  transcriptId?: number
): Promise<MetricsResponse> {
  const params = new URLSearchParams({ category });
  if (speakerId !== undefined) {
    params.append('speaker_id', speakerId.toString());
  }
  if (transcriptId !== undefined) {
    params.append('meeting_transcript_id', transcriptId.toString());
  }
  
  const response = await fetch(`${API_BASE_URL}/metrics?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }
  return response.json();
}

export async function fetchPieChartData(
  category: string,
  subCategory?: string,
  speakerId?: number,
  transcriptId?: number
): Promise<PieChartDataPoint[]> {
  const params = new URLSearchParams({ category });
  if (subCategory) {
    params.append('sub_category', subCategory);
  }
  if (speakerId !== undefined) {
    params.append('speaker_id', speakerId.toString());
  }
  if (transcriptId !== undefined) {
    params.append('meeting_transcript_id', transcriptId.toString());
  }
  
  const response = await fetch(`${API_BASE_URL}/pie-chart-data?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pie chart data');
  }
  const data = await response.json();
  return data.data || [];
}
