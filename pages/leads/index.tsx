import { supabase } from "@/lib/supabaseClient";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User, useUser } from "@supabase/auth-helpers-react";
import { GetServerSidePropsContext } from "next";

interface LeadsPageProps
{
    user: User;
}

export default function LeadsPage({ user }: LeadsPageProps)
{
    return (
        <div className="w-full h-full flex items-center justify-center gap-4">
            <div className="h-full flex flex-col p-8 w-full max-w-[1920px]">
                <div className="w-full rounded-xl p-4 flex flex-row flex-wrap items-center justify-center">
                    <div className="flex-1 min-w-[300px] h-96 border-r-[1px] border-primary">
                        <p className="text-center font-medium">
                            Preparing for Contact / First Contact
                        </p>
                    </div>
                    <div className="flex-1 min-w-[300px] h-96 border-r-[1px] border-primary">
                        <p className="text-center font-medium">
                            Possible Lead
                        </p>
                    </div>
                    <div className="flex-1 min-w-[300px] h-96 border-r-[1px] border-primary">
                        <p className="text-center font-medium">
                            Probable Lead
                        </p>
                    </div>
                    <div className="flex-1 min-w-[300px] h-96">
                        <p className="text-center font-medium">
                            Contract Signed
                        </p>
                    </div>
                </div>
                <div className="w-full flex-grow">
                    
                </div>
            </div>
        </div>
    )
}


export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
    const supabase = createServerSupabaseClient(context);
    const { data: { session }} = await supabase.auth.getSession();


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
            user: session?.user
        }
    }
}