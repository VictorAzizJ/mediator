import { NextRequest, NextResponse } from 'next/server';
import { createMagicLinkToken } from '@/lib/auth/tokens';
import { sendMagicLinkEmail } from '@/lib/auth/emails';

/**
 * POST /api/auth/magic-link
 *
 * Send a magic link email for passwordless authentication
 *
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Development mode - return success without actually sending
      console.warn('Supabase not configured - magic link would be sent to:', email);
      return NextResponse.json({
        success: true,
        message: 'Check your email for the sign-in link',
        _dev: {
          note: 'Supabase not configured - no email sent',
          mockToken: 'dev-token-' + Date.now(),
        },
      });
    }

    // Create the magic link token
    const { token } = await createMagicLinkToken(email);

    // Get the base URL for the magic link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'http://localhost:3000';

    // Send the email
    const emailResult = await sendMagicLinkEmail(email, token, baseUrl);

    if (!emailResult.success) {
      // If email fails but we created the token, still consider it a partial success
      // The user can try again
      console.error('Failed to send magic link email:', emailResult.error);

      // In development, return the token directly for testing
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'Check your email for the sign-in link',
          _dev: {
            note: 'Email sending failed - use this token directly',
            token,
            verifyUrl: `${baseUrl}/auth/verify?token=${token}`,
          },
        });
      }

      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Check your email for the sign-in link',
    });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
