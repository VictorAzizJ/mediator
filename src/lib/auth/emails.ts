import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors when API key isn't available
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'Mediator <noreply@mediator.app>';

/**
 * Send a magic link email for authentication
 */
export async function sendMagicLinkEmail(
  email: string,
  token: string,
  baseUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping email');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  const magicLink = `${baseUrl}/auth/verify?token=${token}`;

  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Sign in to Mediator',
      html: getMagicLinkEmailHTML(magicLink),
      text: getMagicLinkEmailText(magicLink),
    });

    if (error) {
      console.error('Failed to send magic link email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error sending magic link email:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send email',
    };
  }
}

/**
 * Magic link email HTML template
 */
function getMagicLinkEmailHTML(magicLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Mediator</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

    <!-- Logo/Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px;">
        <span style="color: white; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Mediator</span>
      </div>
    </div>

    <!-- Main Content -->
    <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px; text-align: center;">
      Sign in to your account
    </h1>

    <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 32px; text-align: center;">
      Click the button below to securely sign in to Mediator. This link will expire in 15 minutes.
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${magicLink}"
         style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
        Sign in to Mediator
      </a>
    </div>

    <!-- Alternative Link -->
    <p style="font-size: 14px; color: #888; text-align: center; margin: 0 0 16px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="font-size: 12px; color: #6366f1; word-break: break-all; background: #f5f5f5; padding: 12px; border-radius: 6px; margin: 0 0 32px;">
      ${magicLink}
    </p>

    <!-- Security Notice -->
    <div style="border-top: 1px solid #eee; padding-top: 24px;">
      <p style="font-size: 13px; color: #888; line-height: 1.5; margin: 0;">
        <strong>Didn't request this email?</strong><br>
        If you didn't try to sign in, you can safely ignore this email. Someone may have entered your email address by mistake.
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 24px;">
    <p style="font-size: 12px; color: #888; margin: 0;">
      &copy; ${new Date().getFullYear()} Mediator. Communication skills training.
    </p>
  </div>
</body>
</html>
`;
}

/**
 * Magic link email plain text version
 */
function getMagicLinkEmailText(magicLink: string): string {
  return `
Sign in to Mediator

Click this link to sign in (expires in 15 minutes):
${magicLink}

If you didn't request this email, you can safely ignore it.

---
Mediator - Communication skills training
`;
}

/**
 * Send a welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Mediator',
      html: getWelcomeEmailHTML(name),
      text: getWelcomeEmailText(name),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send email',
    };
  }
}

function getWelcomeEmailHTML(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Mediator</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px;">
        <span style="color: white; font-size: 24px; font-weight: 600;">Mediator</span>
      </div>
    </div>

    <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px;">
      Welcome, ${name}!
    </h1>

    <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 24px;">
      You're all set to start practicing communication skills with Mediator.
    </p>

    <h2 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px;">
      Getting Started
    </h2>

    <ul style="font-size: 15px; color: #666; line-height: 1.8; margin: 0 0 24px; padding-left: 20px;">
      <li><strong>DEAR MAN</strong> - Practice assertive communication</li>
      <li><strong>GIVE</strong> - Build and maintain relationships</li>
      <li><strong>FAST</strong> - Set boundaries with self-respect</li>
    </ul>

    <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0;">
      Start a practice session from your dashboard to begin improving your interpersonal effectiveness.
    </p>
  </div>
</body>
</html>
`;
}

function getWelcomeEmailText(name: string): string {
  return `
Welcome to Mediator, ${name}!

You're all set to start practicing communication skills.

Getting Started:
- DEAR MAN - Practice assertive communication
- GIVE - Build and maintain relationships
- FAST - Set boundaries with self-respect

Start a practice session from your dashboard to begin improving your interpersonal effectiveness.

---
Mediator - Communication skills training
`;
}
