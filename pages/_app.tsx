import '@/styles/globals.css'
import type { AppProps } from 'next/app';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import AppNavbar from '@/components/AppNavbar';
import AppFooter from '@/components/AppFooter';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
      <Head>
        <title>Psychostasia</title>
      </Head>
      <div className='w-screen h-screen flex flex-col bg-secondary'>
        <AppNavbar  />
        <div className='flex-grow'>
          <Component {...pageProps} />
        </div>
        <AppFooter />
      </div>
    </SessionContextProvider>
  )
}
