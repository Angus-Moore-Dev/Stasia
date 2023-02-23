import AppNavbar from '@/components/AppNavbar';
import Head from 'next/head';
import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';

export default function HomePage()
{
	const audioRef = useRef<HTMLAudioElement>(null);
	useEffect(() => {
		audioRef.current?.click();
		audioRef.current?.play();
	}, []);

	return (
		<div className="w-full h-full flex flex-col items-center justify-center">
			<Head>
				<title>Jensen Labs Template</title>
			</Head>
			<Image src='https://media.tenor.com/UeTh6kTjoP0AAAAd/topg-andrew.gif' width='400' height='500' alt='Mr Producer' className='rounded-lg pb-2' />
			<audio id="player" autoPlay controls loop className='w-[400px]'>
				<source src="mr_producer.mp3" type="audio/mp3" />
			</audio>
			<p className="text-2xl font-semibold">Jensen Labs Template Repository.</p>
			<br />
			<span>
				Please ensure you have your Auth0 Tenant and relevant Azure resources setup. 
				<br />
				Then configure the .env.local and storage buckets with whatever you need.
			</span>
			<small>If not, ensure you have that setup in the environment variables before building.</small>
			<small>Otherwise, have a fucking sook if something doesn't work. 🤓</small>
			<br />
			<span>
				Tailwind is installed by default, so is @azure/data-tables, @azure/storage-blob, Material UI (including icons) <br />
			</span>
			<span className='text-center mt-4'>
				We also use Doppler, read the docs <a href='https://docs.doppler.com/docs/install-cli' target='_blank' className='text-blue-500 hover:text-blue-600'>here</a> to get started. 
				<br />
				It's to ensure that environment variables are never in the configs or in the repository ever. Every developer is required to have it.
			</span>
		</div>
	)
}