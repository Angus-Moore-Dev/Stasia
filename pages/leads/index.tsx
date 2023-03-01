import { supabase } from "@/lib/supabaseClient";
import { Lead, LeadStage } from "@/models/Lead";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User, useUser } from "@supabase/auth-helpers-react";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
interface LeadsPageProps
{
    user: User;
    leads: Lead[];
}

export default function LeadsPage({ user, leads }: LeadsPageProps)
{
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto">
            <section className="w-full flex flex-row items-center">
                <span>Overview</span>
            </section>
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
                <div className="flex-1 min-w-[300px] h-96 flex flex-col">
                    <p className="text-center font-medium">
                        Contract Signed
                    </p>
                    <div className="w-full flex-grow px-1">
                        {
                            leads.filter(x => x.stage === LeadStage.ContractSigned).map(lead => {
                                return <div className="h-14 w-full bg-primary text-secondary font-semibold px-4 flex flex-row items-center gap-2">
                                    <Image src={lead.previewImageURL} alt={lead.name} width='40' height='40' className="object-cover" />
                                    <p>{lead.name}</p>
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
            <div className="w-full flex-grow flex flex-col">
                <section className="w-full flex flex-row items-center mb-1">
                    <span>Manage Leads</span>
                    <Link href='/leads/new' className="ml-auto">
                        <button className="px-4 py-1 rounded-lg bg-secondary text-primary transition hover:bg-primary hover:text-secondary font-bold">
                            New Lead
                        </button>
                    </Link>
                </section>
                <section className="w-full flex-grow flex flex-col">
                    {
                        leads && leads.map(lead => {
                            return (
                                <div className="h-14 bg-tertiary border-b-primary border-b-[1px] flex items-center gap-6 px-8 transition duration-300 hover:text-secondary hover:border-b-zinc-100 hover:bg-primary hover:font-semibold hover:cursor-pointer">
                                    <Link href={`/leads/${lead.id}`} className="flex flex-row gap-6 w-full items-center h-full">
                                        <Image src={lead.previewImageURL} alt={lead.name} width='40' height='40' className="object-cover" />
                                        <p>{lead.name}</p>
                                        <p>{lead.created_at}</p>
                                        <p>{lead.description}</p>
                                        <p>{lead.associations.join(' ')}</p>
                                        <p className="ml-auto font-semibold">{lead.stage?.valueOf() ?? LeadStage.UNKNOWN}</p>
                                    </Link>
                                    <button className=" transition-colors hover:text-zinc-100 hover:bg-tertiary p-2 rounded-lg" onClick={() => {
                                        alert('more settings');
                                    }}>
                                        <MoreHorizIcon fontSize="large" />
                                    </button>
                                </div>
                            )
                        })
                    }
                </section>
            </div>
        </div>
    )
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