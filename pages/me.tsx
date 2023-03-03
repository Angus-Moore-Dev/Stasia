import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { GetServerSidePropsContext } from "next";

export default function MePage()
{
	const user = useUser();

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            {
                user &&
                <p>{user.email}</p>
            }
            {
                !user &&
                <p>You are not authenticated.</p>
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