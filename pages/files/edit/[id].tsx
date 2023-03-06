import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

interface EditDocumentWindowProps
{
    user: User;
}

export default function EditDocumentWindow({ user }: EditDocumentWindowProps)
{
    const router = useRouter();
    const fileId = router.query['id'] as string;
    return <div className='w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto'>
        Editor for document {fileId}
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
			user: session?.user ?? null
		}
	}
}