import { Lead } from "@/models/Lead";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

interface SpecificLeadManagementPageProps
{
    user: User;
}

export default function SpecificLeadManagementPage({ user }: SpecificLeadManagementPageProps)
{
    const router = useRouter();
    const { leadId } = router.query;
    const id = leadId as string;

    return <div className="w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto">
        {
            id
        }
    </div>
}



export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
    const supabase = createServerSupabaseClient(context);
    const { data: { session }} = await supabase.auth.getSession();
    const { data, error } = await supabase.from('leads').select('*'); 
    const leads = data as Lead[];
    for (const lead of leads)
        lead.created_at = new Date(lead.created_at).toLocaleDateString();

    if (!session)
    {
        return {
            redirect: {
                destination: '/401',
                permanent: false
            }
        }
    }

    return {
        props: {
            user: session?.user,
            leads: leads
        }
    }
}