import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";

interface NewLeadPageProps
{
    user: User;
}

export default function NewLeadPage({ user }: NewLeadPageProps)
{
    return <div className="w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto">
        {
            user && user.email
        }
    </div>
}



export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
    const supabase = createServerSupabaseClient(context);
    const { data: { session }} = await supabase.auth.getSession();

    if (!session)
    {
        return {
            redirect: '/401',
            permanent: false
        }
    }

    return {
        props: {
            user: session?.user
        }
    }
}