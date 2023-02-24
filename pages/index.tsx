import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'

export default function HomePage()
{
	const supabase = useSupabaseClient();
	const user = useUser();
	return (
		<div className="w-full h-full flex flex-col items-center justify-center bg-secondary">
			{/* <LoadingBox content={<Image src='/favicon.png' width='128' height='128' alt='logo' />} /> */}
			{
				!user &&
				<Auth supabaseClient={supabase} appearance={
					{ 
						style: {
							container: { width: '25vw', minWidth: '350px', maxWidth: '50vw' },
							button: { background: '#00ff48', color: '#0e0e0e', fontWeight: '900'}
						},
						theme: ThemeSupa,
					}
				} theme="dark" />
			}
			{
				user &&
				<div className='flex-grow flex flex-col items-center justify-center'>
					{
						user.email
					}
				</div>
			}
		</div>
	)
}