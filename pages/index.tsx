import { User, useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import CodeSharpIcon from '@mui/icons-material/CodeSharp';
import PersonOutlineSharpIcon from '@mui/icons-material/PersonOutlineSharp';
import PersonSharpIcon from '@mui/icons-material/PersonSharp';
import ChatBubbleSharpIcon from '@mui/icons-material/ChatBubbleSharp';
import CalendarMonthSharpIcon from '@mui/icons-material/CalendarMonthSharp';
import AttachMoneySharpIcon from '@mui/icons-material/AttachMoneySharp';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { GetServerSidePropsContext } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BadgeIcon from '@mui/icons-material/Badge';
import SignInPage from '@/components/SignInPage';
import logo from '../public/logo.png';
import Image from 'next/image';

interface HomePageProps
{
	user: User | null;
}


export default function HomePage({ user }: HomePageProps)
{
	return (
		<div className="w-full h-full flex flex-col items-center justify-center bg-secondary">
			{
				user &&
				<div className='min-h-full flex-grow flex flex-col p-8 w-full max-w-[1920px]'>
					<div className='flex-grow flex flex-col gap-3 items-center justify-center'>
						<Image src={logo} alt='Stasia' width='400' height='350' className='mx-auto' />
						<span className='mb-4 font-medium'>The Ultimate Solution For Your Business Management</span>
						<div className='flex flex-row flex-wrap gap-3 items-center justify-center'>
							<Link href='/customers'>
								<InteractiveBox title='Customers (coming soon)' icon={<AttachMoneySharpIcon fontSize='large' />}  />
							</Link>
							<Link href='/contacts'>
								<InteractiveBox title='Contacts' icon={<PersonSharpIcon fontSize='large' />} />
							</Link>
							<Link href='/leads'>
								<InteractiveBox title='Leads' icon={<PersonOutlineSharpIcon fontSize='large' />} />
							</Link>
							<InteractiveBox title='Chat (coming soon)' icon={<ChatBubbleSharpIcon fontSize='large' />} />
						</div>
						<div className='flex flex-row flex-wrap gap-3 items-center justify-center'>
							<Link href='/files'>
								<InteractiveBox title='Files' icon={<AccountTreeIcon fontSize='large' />} />
							</Link>
							<Link href='/projects'>
								<InteractiveBox title='Projects' icon={<CodeSharpIcon fontSize='large' />} />
							</Link>
							<InteractiveBox title='Calendar (coming soon)' icon={<CalendarMonthSharpIcon fontSize='large' />} />
							<InteractiveBox title='Staff (coming soon)' icon={<BadgeIcon fontSize='large' />}  />
						</div>
					</div>
				</div>
			}
		</div>
	)
}



export const getServerSideProps = async (context: GetServerSidePropsContext) =>
{
	const supabaseClient = createServerSupabaseClient(context);
	const { data: { session }} = await supabaseClient.auth.getSession();
	if (!session)
	{
		return {
			redirect: {
				destination: '/sign-in',
				permanent: false
			}
		}
	}
	return {
		props: {
			user: session?.user ?? null
		}
	}
}



interface InteractiveBoxProps
{
	title: string;
	icon: JSX.Element;
}

function InteractiveBox({title, icon}: InteractiveBoxProps)
{
	return (
		<div className='group w-64 h-64 bg-tertiary p-4 rounded-md drop-shadow-sm flex flex-col items-center justify-center transition hover:bg-primary hover:text-secondary hover:shadow-md hover:shadow-primary hover:cursor-pointer hover:font-medium'>
			<div className='p-2 rounded-xl text-primary group-hover:text-secondary group-hover:animate-pulse'>
				{icon}
			</div>
			<p className='text-center font-medium'>{title}</p>
		</div>
	)
}