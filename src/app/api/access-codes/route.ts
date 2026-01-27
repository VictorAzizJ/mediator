import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/access-codes
 *
 * List access codes (admin only)
 * Query params: ?org_id=xxx&type=pilot&active_only=true
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orgId = searchParams.get('org_id');
  const type = searchParams.get('type');
  const activeOnly = searchParams.get('active_only') === 'true';

  // Check Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    let query = supabase
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      codes: data,
      count: data.length,
    });
  } catch (error) {
    console.error('Error fetching access codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch access codes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/access-codes
 *
 * Create a new access code (admin only)
 *
 * Body: {
 *   code?: string (auto-generated if not provided)
 *   type: 'pilot' | 'demo' | 'enterprise'
 *   orgId?: string
 *   maxUses?: number
 *   expiresAt?: string (ISO date)
 *   description?: string
 * }
 */
export async function POST(request: NextRequest) {
  // Check Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { code, type, orgId, maxUses, expiresAt, description } = body;

    // Validate type
    if (!type || !['pilot', 'demo', 'enterprise'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be pilot, demo, or enterprise' },
        { status: 400 }
      );
    }

    // Generate code if not provided
    const accessCode = code?.toUpperCase() || generateAccessCode(type);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if code already exists
    const { data: existing } = await supabase
      .from('access_codes')
      .select('id')
      .eq('code', accessCode)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Access code already exists' },
        { status: 409 }
      );
    }

    // Create the access code
    const { data, error } = await supabase
      .from('access_codes')
      .insert({
        code: accessCode,
        type,
        org_id: orgId || null,
        max_uses: maxUses || null,
        expires_at: expiresAt || null,
        description: description || null,
        is_active: true,
        uses_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      accessCode: data,
    });
  } catch (error) {
    console.error('Error creating access code:', error);
    return NextResponse.json(
      { error: 'Failed to create access code' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/access-codes
 *
 * Update an access code (admin only)
 *
 * Body: {
 *   id: string
 *   isActive?: boolean
 *   maxUses?: number
 *   expiresAt?: string
 *   description?: string
 * }
 */
export async function PATCH(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { id, isActive, maxUses, expiresAt, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Access code ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const updates: Record<string, unknown> = {};
    if (typeof isActive === 'boolean') updates.is_active = isActive;
    if (maxUses !== undefined) updates.max_uses = maxUses;
    if (expiresAt !== undefined) updates.expires_at = expiresAt;
    if (description !== undefined) updates.description = description;

    const { data, error } = await supabase
      .from('access_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      accessCode: data,
    });
  } catch (error) {
    console.error('Error updating access code:', error);
    return NextResponse.json(
      { error: 'Failed to update access code' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/access-codes
 *
 * Delete an access code (admin only)
 *
 * Body: { id: string }
 */
export async function DELETE(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Access code ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('access_codes')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Access code deleted',
    });
  } catch (error) {
    console.error('Error deleting access code:', error);
    return NextResponse.json(
      { error: 'Failed to delete access code' },
      { status: 500 }
    );
  }
}

/**
 * Generate a random access code
 */
function generateAccessCode(type: string): string {
  const prefix = type.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}
