import NewThreadModal from "@/components/chat/NewThreadModal";
import Button from "@/components/common/Button";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";

interface ChatPageProps
{
    user: User;
}


export default function ChatPage({ user }: ChatPageProps)
{
	const [showNewThreadModal, setShowNewThreadModal] = useState(false);
    useEffect(() => {
        
    }, []);

    return <div className='w-full h-full flex flex-col gap-4 max-w-[1920px] p-8 mx-auto'>
		<div className="w-full flex flex-row items-center">
			<span>Chat</span>
			<Button text='New Thread' onClick={() => setShowNewThreadModal(true)} className="ml-auto" />
			<NewThreadModal show={showNewThreadModal} setShow={setShowNewThreadModal} />
		</div>
        <div className="w-full h-full bg-tertiary rounded">
			
		</div>
    </div>
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

    const allThreads = await supabaseClient.from('')

	return {
		props: {
			user: session?.user ?? null
		}
	}
}