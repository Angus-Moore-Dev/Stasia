import Button from "@/components/common/Button";
import { supabase } from "@/lib/supabaseClient";
import { Contact } from "@/models/Contact";
import { Lead, LeadStage } from "@/models/Lead";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import Image from 'next/image';
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { v4 } from "uuid";

interface EditLeadPageProps
{
    user: User;
    contact: Contact;
}

export default function EditLeadPage({ user, contact }: EditLeadPageProps)
{
    const router = useRouter();
    const [contactData, setContactData] = useState(new Lead(contact.id, contact.name, contact.previewImageURL, contact.created_at, LeadStage.UNKNOWN));

    return <div className="w-full h-full flex flex-col items-center justify-start gap-4 max-w-[1920px] p-8 mx-auto">
        <div className="w-full flex flex-row justify-between">
            <Link href='/leads' className="mr-auto">
                <button className="px-4 py-1 rounded-lg bg-secondary text-primary transition hover:bg-primary hover:text-secondary font-bold">
                    Back to New Lead Selection
                </button>
            </Link>
            {
                contactData.stage === LeadStage.ContractSigned &&
                <div className="animate-pulse">
                    <Button text='Upgrade to Customer' onClick={() => {
                        alert('upgrade!');
                    }} />
                </div>
            }
        </div>
        <div className="flex flex-row gap-4 justify-center items-center mx-auto max-w-6xl w-full">
            <Image 
            src={contact.previewImageURL} 
            alt='Contact Image' 
            width='500' height='500' 
            className="w-64 h-64 min-w-[256px] min-h-[256px] rounded-md border-2 border-primary object-cover" 
            />
            <section className="w-full h-64 flex flex-row">
                <div className="w-full flex flex-col">
                    <p className="pb-2 bg-transparent text-zinc-100 font-semibold text-4xl outline-none border-b-2 border-b-primary w-96 h-10">
                        {contact.name}
                    </p>
                    <div className="w-full flex flex-col">
                        <textarea value={contact.description}
                        className="px-2 pb-2 pt-4 bg-transparent text-zinc-100 outline-none font-medium w-2/3 h-[250px] max-h-[250px] min-h-[250px] scrollbar" placeholder="short description" />
                    </div>
                </div>
            </section>
        </div>
        <div className="w-full max-w-6xl flex-grow flex flex-col gap-6">
            <section>
                <span>Lead Stage</span>
                <div className="flex flex-row flex-wrap gap-2 items-center">
                {
                    [
                        {
                            text: 'Preparing for Contact', 
                            stage: LeadStage.PreparingForContact,
                        },
                        {
                            text: 'Possibly a Lead',
                            stage: LeadStage.PossibleLead,
                        },
                        {
                            text: 'Probably a Lead',
                            stage: LeadStage.ProbableLead,
                        },
                        {
                            text: 'Contract is Signed',
                            stage: LeadStage.ContractSigned,
                        },
                    ].map(stage => {
                        return (
                            <button className="w-64 py-4 bg-tertiary text-zinc-100 transition hover:bg-primary hover:text-secondary font-semibold rounded aria-selected:bg-primary aria-selected:text-secondary"
                            aria-selected={stage.stage === contactData.stage}
                            onClick={() => {
                                setContactData({...contactData, stage: stage.stage});
                            }}>
                                {
                                    stage.text
                                }
                            </button>
                        )
                    })
                }
                </div>
            </section>
            <section className="flex flex-col">
                <span>Initial Lead Contact</span>
                <textarea value={contactData.initialContact} onChange={(e) => setContactData({...contactData, initialContact: e.target.value})} className="p-4 rounded bg-tertiary text-zinc-100 font-medium outline-none resize-none h-80 w-full border-b-primary border-b-2 scrollbar" />
            </section>
            <section className="flex flex-col">
                <span>Primary Lead Elevation Approach</span>
                <textarea value={contactData.primaryElevationApproach} onChange={(e) => setContactData({...contactData, primaryElevationApproach: e.target.value})} className="p-4 rounded bg-tertiary text-zinc-100 font-medium outline-none resize-none h-80 w-full border-b-primary border-b-2 scrollbar" />
            </section>
            <section className="flex flex-col">
                <span>Secondary Lead Elevation Approach</span>
                <textarea value={contactData.secondaryElevationApproach} onChange={(e) => setContactData({...contactData, secondaryElevationApproach: e.target.value})} className="p-4 rounded bg-tertiary text-zinc-100 font-medium outline-none resize-none h-80 w-full border-b-primary border-b-2 scrollbar" />
            </section>
            <section className="flex flex-col">
                <span>Other Comments (Tips for Interaction)</span>
                <textarea value={contactData.otherComments} onChange={(e) => setContactData({...contactData, otherComments: e.target.value})} className="p-4 rounded bg-tertiary text-zinc-100 font-medium outline-none resize-none h-80 w-full border-b-primary border-b-2 scrollbar" />
            </section>
            <button className="px-4 py-1 rounded-lg bg-secondary text-primary transition hover:bg-primary hover:text-secondary font-bold ml-auto mb-10"
            onClick={async () => {
                const insertResult = await supabase.from('leads').insert([
                    {
                        id: contactData.id,
                        stage: contactData.stage,
                        initialContact: contactData.initialContact,
                        primaryElevationApproach: contactData.primaryElevationApproach,
                        secondaryElevationApproach: contactData.secondaryElevationApproach,
                        otherComments: contactData.otherComments
                    }
                ]);
                if (insertResult.status === 201)
                {
                    router.push('/leads');
                }
            }}>
                Update Existing Lead
            </button>
        </div>
    </div>
}


export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
    const supabase = createServerSupabaseClient(context);
    const { data: { session }} = await supabase.auth.getSession();
    const { data, error } = await supabase.from('contacts').select(`*`).eq('id', context.query['newLeadId'] as string).single();
    const contact = data as Contact;
    console.log(data);
    contact.previewImageURL = (await supabase.storage.from('contacts.pictures').getPublicUrl(contact.previewImageURL)).data?.publicUrl ?? '';

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
            contact: data as Contact,
        }
    }
}