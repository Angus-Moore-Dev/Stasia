import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from 'next/app';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import AppNavbar from '@/components/AppNavbar';
import AppFooter from '@/components/AppFooter';
import Head from 'next/head';
import { Router } from 'next/router';
import LoadingBox from '@/components/LoadingBox';
import Image from 'next/image';
import { ToastContainer } from 'react-toastify';


export default function App({ Component, pageProps }: AppProps) {
	const [supabase] = useState(() => createBrowserSupabaseClient());
	const [loading, setLoading] = useState(false);

	useEffect(() => 
	{
		const start = () => {
			setLoading(true);
		};
		const end = () => {
			setLoading(false);
		};
		Router.events.on("routeChangeStart", start);
		Router.events.on("routeChangeComplete", end);
		Router.events.on("routeChangeError", end);
		return () => {
			Router.events.off("routeChangeStart", start);
			Router.events.off("routeChangeComplete", end);
			Router.events.off("routeChangeError", end);
		};
	}, []);

	return (
		<SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
			<Head>
				<title>Stasia</title>
			</Head>
			<div className='w-screen h-screen flex flex-col bg-secondary'>
				<AppNavbar  />
				<div className='flex-grow overflow-x-hidden scrollbar'>
					{
						loading && 
						<div className='flex-grow h-full flex flex-col gap-2 items-center justify-center'>
							<LoadingBox content={<Image src='/favicon.ico' alt='logo' width='40' height='40' />} />
							<small>Hold tight choom...</small>
						</div>
					}
					{
						!loading &&
						<Component {...pageProps} />
					}
				</div>
				<AppFooter />
				<ToastContainer />
			</div>
		</SessionContextProvider>
	)
}
