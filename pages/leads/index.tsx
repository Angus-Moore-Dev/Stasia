import { supabase } from "@/lib/supabaseClient";
import { Lead, LeadStage } from "@/models/Lead";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User, useUser } from "@supabase/auth-helpers-react";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LeadManageComponent from "@/components/leads/LeadManageComponent";
interface LeadsPageProps
{
    user: User;
    leads: Lead[];
}

export default function LeadsPage({ user, leads }: LeadsPageProps)
{
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto">
            <div className="w-full flex flex-row items-center">
                <span>Leads - All Prospective Contacts</span>
                <Link href='/leads/new' className="ml-auto">
                    <button className="px-4 py-1 rounded-lg bg-secondary text-primary transition hover:bg-primary hover:text-secondary font-bold">
                        New Lead
                    </button>
                </Link>
            </div>
            <div className="flex-grow w-full rounded-xl p-4 flex flex-row flex-wrap items-center justify-center">
                <div className="flex-1 min-w-[300px] h-full border-r-[1px] border-primary px-1 flex flex-col gap-2">
                    <p className="text-center font-medium">
                        Preparing
                    </p>
                    {
                        leads.filter(x => x.stage === LeadStage.PreparingForContact).map(lead => {
                            return <Link key={lead.id} href={`/leads/edit/${lead.id}`} className="h-14 w-full text-zinc-100 bg-tertiary font-semibold px-4 flex flex-row items-center gap-2 rounded transition hover:text-secondary hover:bg-primary">
                                <Image priority={true} src={lead.previewImageURL} alt={lead.name} width='40' height='40' className="object-cover" />
                                <p>{lead.name}</p>
                            </Link>
                        })
                    }
                </div>
                <div className="flex-1 min-w-[300px] h-full border-r-[1px] border-primary px-1 flex flex-col gap-2">
                    <p className="text-center font-medium">
                        Possible Lead
                    </p>
                    {
                        leads.filter(x => x.stage === LeadStage.PossibleLead).map(lead => {
                            return <Link key={lead.id} href={`/leads/edit/${lead.id}`} className="h-14 w-full text-zinc-100 bg-tertiary font-semibold px-4 flex flex-row items-center gap-2 rounded transition hover:text-secondary hover:bg-primary">
                                <Image priority={true} src={lead.previewImageURL} alt={lead.name} width='40' height='40' className="object-cover" />
                                <p>{lead.name}</p>
                            </Link>
                        })
                    }
                </div>
                <div className="flex-1 min-w-[300px] h-full border-r-[1px] border-primary px-1 flex flex-col gap-2">
                    <p className="text-center font-medium">
                        Probable Lead
                    </p>
                    {
                        leads.filter(x => x.stage === LeadStage.ProbableLead).map(lead => {
                            return <Link key={lead.id} href={`/leads/edit/${lead.id}`} className="h-14 w-full text-zinc-100 bg-tertiary font-semibold px-4 flex flex-row items-center gap-2 rounded transition hover:text-secondary hover:bg-primary">
                                <Image priority={true} src={lead.previewImageURL} alt={lead.name} width='40' height='40' className="object-cover" />
                                <p>{lead.name}</p>
                            </Link>
                        })
                    }
                </div>
                <div className="flex-1 min-w-[300px] h-full border-r-[1px] border-primary flex flex-col">
                    <p className="text-center font-medium">
                        Contract Signed
                    </p>
                    <div className="w-full flex-grow px-1 flex flex-col gap-2">
                        {
                            leads.filter(x => x.stage === LeadStage.ContractSigned).map(lead => 
                            {
                                return <Link href={`/leads/edit/${lead.id}`} key={lead.id} className="h-14 w-full bg-primary text-secondary font-semibold px-4 flex flex-row items-center gap-2 rounded">
                                    <Image priority={true} src={lead.previewImageURL} alt={lead.name} width='40' height='40' className="object-cover" />
                                    <p>{lead.name}</p>
                                </Link>
                            })
                        }
                    </div>
                </div>
                <div className="flex-1 min-w-[300px] h-full flex flex-col">
                    <p className="text-center font-medium">
                        Stale Lead
                    </p>
                    <div className="w-full flex-grow px-1 flex flex-col gap-2">
                        {
                            leads.filter(x => x.stage === LeadStage.StaleLead).map(lead => 
                            {
                                return <Link href={`/leads/edit/${lead.id}`} key={lead.id} className="h-14 w-full text-zinc-100 bg-tertiary font-semibold px-4 flex flex-row items-center gap-2 rounded transition hover:text-secondary hover:bg-primary">
                                    <Image priority={true} src={lead.previewImageURL} alt={lead.name} width='40' height='40' className="object-cover" />
                                    <p>{lead.name}</p>
                                </Link>
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}


export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
    const supabase = createServerSupabaseClient(context);
    const { data: { session }} = await supabase.auth.getSession();

    const { data, error } = await supabase.from('leads')
    .select(`
        stage,
        contacts (
            id,
            name,
            previewImageURL,
            created_at
        )
    `);

    // these types can be generated automatically by Supabase, however this will have to do for now.
    // TODO: The types of the data need to be generated, however my machine's Docker instance can't seem to generate this so good luck.
    const leads: Lead[] = [];
    for (const lead of data as {stage: string, contacts: {id: string, name: string, previewImageURL: string, created_at: string}}[] ?? [])
    {
        const existingLead = new Lead(lead.contacts.id, lead.contacts.name, lead.contacts.previewImageURL, lead.contacts.created_at, lead.stage as LeadStage);
        console.log(JSON.stringify(existingLead));
        leads.push(existingLead);
    }

    for (const lead of leads)
    {
        lead.created_at = new Date(lead.created_at).toLocaleDateString();
        lead.previewImageURL = (await supabase.storage.from('contacts.pictures').getPublicUrl(lead.previewImageURL)).data?.publicUrl as string;
    }

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
            user: session?.user,
            leads: JSON.parse(JSON.stringify(leads)) as Lead[] // fucking terrible. Find a better way to do this.
        }
    }
}