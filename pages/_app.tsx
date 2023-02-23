import '@/styles/globals.css'
import type { AppProps } from 'next/app';
import { UserProvider, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import AppNavbar from '@/components/AppNavbar';
import AppFooter from '@/components/AppFooter';

export default function App({ Component, pageProps }: AppProps) {
  const { user } = pageProps;
  return (
    // <UserProvider>
      <div className='w-screen h-screen flex flex-col'>
			  <AppNavbar user={user} />
        <div className='flex-grow'>
          <Component {...pageProps} />
        </div>
        <AppFooter />
      </div>
    // </UserProvider>
  )
}
