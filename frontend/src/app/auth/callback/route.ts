import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  //console.log('Auth callback triggered');
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  
  //console.log('Callback params:', { code: !!code, type });

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      //console.log('Session exchange result:', { 
      //  hasSession: !!data.session, 
      //  hasUser: !!data.user, 
      //  error 
      //});
      
      if (!error && data.session) {
        // If this is a password recovery, redirect to reset password page
        if (type === 'recovery') {
          //console.log('Redirecting to reset password page');
          return NextResponse.redirect(`${requestUrl.origin}/reset-password`);
        }
        
        // For other types, redirect to home
        return NextResponse.redirect(`${requestUrl.origin}/`);
      } else {
        console.error('Session exchange failed:', error);
      }
    } catch (err) {
      console.error('Session exchange error:', err);
    }
  }

  //console.log('Redirecting to forgot password due to error');
  return NextResponse.redirect(`${requestUrl.origin}/forgot-password?error=invalid-link`);
}