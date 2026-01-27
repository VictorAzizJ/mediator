import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/access-codes/validate
 *
 * Validate an access code and increment usage count
 *
 * Body: { code: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Access code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    // Check for hardcoded demo code (fallback if Supabase not configured)
    if (normalizedCode === 'MEDIATOR2025') {
      return NextResponse.json({
        valid: true,
        type: 'demo',
        orgId: null,
        message: 'Demo access granted',
      });
    }

    // Check Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Supabase not configured, only accept hardcoded demo code
      return NextResponse.json(
        { valid: false, error: 'Invalid access code' },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look up the access code
    const { data: accessCode, error: fetchError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .single();

    if (fetchError || !accessCode) {
      return NextResponse.json(
        { valid: false, error: 'Invalid access code' },
        { status: 401 }
      );
    }

    // Check if expired
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Access code has expired' },
        { status: 401 }
      );
    }

    // Check if max uses reached
    if (accessCode.max_uses !== null && accessCode.uses_count >= accessCode.max_uses) {
      return NextResponse.json(
        { valid: false, error: 'Access code has reached maximum uses' },
        { status: 401 }
      );
    }

    // Increment usage count
    const { error: updateError } = await supabase
      .from('access_codes')
      .update({
        uses_count: accessCode.uses_count + 1,
      })
      .eq('id', accessCode.id);

    if (updateError) {
      console.error('Failed to increment access code usage:', updateError);
      // Don't fail the validation, just log the error
    }

    return NextResponse.json({
      valid: true,
      type: accessCode.type,
      orgId: accessCode.org_id,
      message: `${accessCode.type.charAt(0).toUpperCase() + accessCode.type.slice(1)} access granted`,
    });
  } catch (error) {
    console.error('Access code validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    );
  }
}
