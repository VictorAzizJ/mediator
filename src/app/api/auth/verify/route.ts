import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyMagicLinkToken, createSessionToken } from '@/lib/auth/tokens';

/**
 * GET /api/auth/verify?token=xxx
 *
 * Verify a magic link token and create a session
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
    );
  }

  // Check Supabase configuration
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Development mode
    if (token.startsWith('dev-token-')) {
      return NextResponse.json({
        success: true,
        user: {
          id: 'dev-user-id',
          email: 'dev@example.com',
        },
        sessionToken: 'dev-session-' + Date.now(),
        _dev: true,
      });
    }
    return NextResponse.json(
      { error: 'Authentication service not configured' },
      { status: 503 }
    );
  }

  try {
    // Verify the magic link token
    const tokenResult = await verifyMagicLinkToken(token);

    if (!tokenResult) {
      return NextResponse.json(
        { error: 'Invalid or expired link. Please request a new one.' },
        { status: 401 }
      );
    }

    const { email } = tokenResult;

    // Get or create the user in our user_profiles table
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Check if user exists
    let { data: user, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = not found, which is fine for new users
      console.error('Error fetching user:', fetchError);
      throw fetchError;
    }

    const isNewUser = !user;

    if (!user) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          email: email.toLowerCase(),
          name: email.split('@')[0], // Default name from email
          account_type: 'individual',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      user = newUser;
    }

    // Update last active timestamp
    await supabase
      .from('user_profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id);

    // Create a session token
    const session = await createSessionToken(user.id, email);

    // Return success with user data and session token
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.org_id,
        accountType: user.account_type,
      },
      sessionToken: session.token,
      expiresAt: session.expiresAt.toISOString(),
      isNewUser,
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/verify
 *
 * Verify a session token (for subsequent requests)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 401 }
      );
    }

    // Check Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      if (sessionToken.startsWith('dev-session-')) {
        return NextResponse.json({
          valid: true,
          user: {
            id: 'dev-user-id',
            email: 'dev@example.com',
          },
          _dev: true,
        });
      }
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify the session token
    const { data: tokenData, error } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('token', sessionToken)
      .eq('type', 'session')
      .single();

    if (error || !tokenData) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Check expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, reason: 'expired' }, { status: 401 });
    }

    // Get user data
    const { data: user } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', tokenData.user_id)
      .single();

    return NextResponse.json({
      valid: true,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.org_id,
        accountType: user.account_type,
      } : null,
    });
  } catch (error) {
    console.error('Session verify error:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
