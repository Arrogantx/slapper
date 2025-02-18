'use client';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Update or create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          wallet_address: user.user_metadata.wallet_address,
          twitter_id: user.user_metadata.twitter_id,
          twitter_username: user.user_metadata.twitter_username,
        }, {
          onConflict: 'wallet_address'
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
    }
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}