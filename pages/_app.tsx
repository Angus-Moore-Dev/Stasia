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
	const [pageName, setPageName] = useState('');

	useEffect(() => 
	{
		const start = (url: string) => {
			setPageName(url.split('/')[1]);
			setLoading(true);
		};
		const end = (url: string) => {
			setLoading(false);
		};
		Router.events.on("routeChangeStart", start);
		Router.events.on("routeChangeComplete", end);
		Router.events.on("routeChangeError", end);

		window.onbeforeunload = function() {
			// Currently sessionStorage is only being used for Blob URL caching, so it's safe to use this to revoke URLs
			sessionStorage.clear();
		}

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
							<small className='capitalize'>Loading {pageName}</small>
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
