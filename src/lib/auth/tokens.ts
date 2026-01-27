import { createClient } from '@supabase/supabase-js';

// Token expiration times
const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a magic link token and store it in the database
 */
export async function createMagicLinkToken(email: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const token = generateToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MS);

  // Store the token
  const { error } = await supabase.from('auth_tokens').insert({
    token,
    email: email.toLowerCase().trim(),
    type: 'magic_link',
    expires_at: expiresAt.toISOString(),
    used: false,
  });

  if (error) {
    console.error('Failed to create magic link token:', error);
    throw new Error('Failed to create authentication token');
  }

  return { token, expiresAt };
}

/**
 * Verify a magic link token and return the associated email
 */
export async function verifyMagicLinkToken(token: string): Promise<{
  email: string;
  userId?: string;
} | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Find the token
  const { data: tokenData, error: fetchError } = await supabase
    .from('auth_tokens')
    .select('*')
    .eq('token', token)
    .eq('type', 'magic_link')
    .eq('used', false)
    .single();

  if (fetchError || !tokenData) {
    return null;
  }

  // Check expiration
  if (new Date(tokenData.expires_at) < new Date()) {
    return null;
  }

  // Mark token as used
  const { error: updateError } = await supabase
    .from('auth_tokens')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', tokenData.id);

  if (updateError) {
    console.error('Failed to mark token as used:', updateError);
  }

  return { email: tokenData.email };
}

/**
 * Create a session token for an authenticated user
 */
export async function createSessionToken(
  userId: string,
  email: string
): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

  // Store the session token
  const { error } = await supabase.from('auth_tokens').insert({
    token,
    email: email.toLowerCase().trim(),
    user_id: userId,
    type: 'session',
    expires_at: expiresAt.toISOString(),
    used: false,
  });

  if (error) {
    console.error('Failed to create session token:', error);
    throw new Error('Failed to create session');
  }

  return { token, expiresAt };
}

/**
 * Verify a session token and return the user info
 */
export async function verifySessionToken(token: string): Promise<{
  userId: string;
  email: string;
} | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: tokenData, error } = await supabase
    .from('auth_tokens')
    .select('*')
    .eq('token', token)
    .eq('type', 'session')
    .single();

  if (error || !tokenData) {
    return null;
  }

  // Check expiration
  if (new Date(tokenData.expires_at) < new Date()) {
    return null;
  }

  return {
    userId: tokenData.user_id,
    email: tokenData.email,
  };
}

/**
 * Invalidate a session token (logout)
 */
export async function invalidateSessionToken(token: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase
    .from('auth_tokens')
    .delete()
    .eq('token', token);

  return !error;
}
