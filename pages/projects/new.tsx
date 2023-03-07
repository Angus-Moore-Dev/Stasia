
import Button from "@/components/common/Button";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js"
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

interface ProectsPageProps
{
    user: User;
}

export default function NewProjectPage({ user }: ProectsPageProps)
{
    const router = useRouter();
    return <div className='w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto'>
        <div className="w-full flex items-center gap-2">
            <Button text='Back to Projects' onClick={() => {
                router.push('/projects');
            }} className="mr-auto" />
        </div>
        <div className="flex-grow flex flex-col w-full">

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

	return {
		props: {
			user: session?.user ?? null,
		}
	}
}