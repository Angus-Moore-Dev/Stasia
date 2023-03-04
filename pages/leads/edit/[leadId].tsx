import LoadingBox from "@/components/LoadingBox";
import Button from "@/components/common/Button";
import { CommentBox } from "@/components/common/Comment";
import { supabase } from "@/lib/supabaseClient";
import { Contact } from "@/models/Contact";
import { Lead, LeadStage } from "@/models/Lead";
import { Comment } from "@/models/chat/Comment";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import Image from 'next/image';
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import css from "styled-jsx/css";
import { v4 } from "uuid";

interface EditLeadPageProps
{
    user: User;
    contact: Lead;
}

export default function EditLeadPage({ user, contact }: EditLeadPageProps)
{
    const router = useRouter();
    const [contactData, setContactData] = useState(contact);
    const [viewComments, setViewComments] = useState(false);
    const [messagetoSendContents, setMessagetoSendContents] = useState('');
    const [comments, setComments] = useState<Comment[]>();
    const [commentsIsLoading, setCommentsIsLoading] = useState(true);
    const updateMessage = useCallback((comment: Comment) => 
    {
        setComments(comments => [...comments ?? [], comment]);
    }, []);
    const removeMessage = useCallback((id: string) => 
    {
        setComments(comments => [...comments?.filter(x => x.id !== id) ?? []]);
    }, []);

    useEffect(() => {
        const fetchComments = async() => {
            if (viewComments && !comments)
            {
                const { data, error } = await supabase.from('lead_comments').select('*').eq('leadId', contact.id);
                const comments =  data as Comment[];
                setComments(comments);
                setCommentsIsLoading(false);
                const channel = supabase.channel('table-db-changes')
                .on('postgres_changes', {event: '*', schema: 'public', table: 'lead_comments'}, (payload) => {
                    if (payload.eventType === 'INSERT')
                    {
                        const message = payload.new as Comment;
                        if (message.leadId === contact.id)
                        {
                            // ADD THIS MESSAGE ONTO THE LIST!
                            updateMessage(message);
                        }
                    }
                    else if (payload.eventType === 'UPDATE')
                    {
                        let commentsTmp = [...comments];
                        commentsTmp[commentsTmp.findIndex(x => x.id === payload.new.id)].message = payload.new.message;
                        setComments(commentsTmp);
                    }
                    else if (payload.eventType === 'DELETE')
                    {
                        const deletedId = payload.old.id as string;
                        removeMessage(deletedId);
                    }
                }).subscribe((status) => {
                    console.log(status);
                    if (status === 'CLOSED')
                    {
                        channel.subscribe();
                    }
                });
            }
        }
        fetchComments();
    }, [viewComments]);

    return <div className="w-full h-full flex flex-col items-center justify-start gap-4 max-w-[1920px] p-8 mx-auto">
        <div className="w-full flex flex-row justify-between">
            <Link href='/leads' className="mr-auto">
                <button className="px-4 py-1 rounded-lg bg-secondary text-primary transition hover:bg-primary hover:text-secondary font-bold">
                    Back to Leads
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
        <div className="flex flex-row flex-wrap gap-4 justify-center items-center mx-auto max-w-6xl w-full">
            <Image 
            src={contact.previewImageURL} 
            alt='Contact Image' 
            width='500' height='500' 
            className="w-64 h-64 min-w-[256px] min-h-[256px] rounded-md border-2 border-primary object-cover" 
            />
            <section className="flex-grow h-64 flex flex-row">
                <div className="w-full flex flex-col">
                    <p className="pb-2 bg-transparent text-zinc-100 font-semibold text-4xl outline-none border-b-2 border-b-primary w-96 h-10">
                        {contact.name}
                    </p>
                    <div className="w-full flex flex-col">
                        <textarea value={contact.description} readOnly={true}
                        className="px-2 pb-2 pt-4 bg-transparent text-zinc-100 outline-none font-medium w-2/3 h-[250px] max-h-[250px] min-h-[250px] scrollbar" placeholder="short description" />
                    </div>
                </div>
            </section>
        </div>
        <div className="w-full max-w-6xl flex-grow flex flex-col gap-4">
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
            <div className="w-full flex flex-row gap-2">
                <Button text='Manage' onClick={() => {setViewComments(false)}} className="aria-selected:bg-primary aria-selected:text-secondary w-44" ariaSelected={!viewComments} />
                <Button text='Comments' onClick={() => {setViewComments(true)}} className="aria-selected:bg-primary aria-selected:text-secondary w-44" ariaSelected={viewComments} />
            </div>
            {
                viewComments &&
                <div className="w-full flex-grow flex flex-col">
                    <section className="flex-grow flex flex-col gap-1 overflow-y-auto max-h-[40vh] scrollbar mb-4">
                        {
                            commentsIsLoading &&
                            <div className="flex-grow flex items-center justify-center">
                                <LoadingBox />
                            </div>
                        }
                        {
                            comments && comments.length > 0 && !commentsIsLoading && comments.map(comment => <CommentBox comment={comment} />)
                        }
                        {
                            comments && comments.length === 0 && !commentsIsLoading &&
                            <div className='flex-grow flex items-center justify-center'>
                                <p>No comments.</p>
                            </div>
                        }
                    </section>
                    <section className="h-14 flex flex-row items-center">
                    <textarea 
                        value={messagetoSendContents} 
                        onChange={(e) => setMessagetoSendContents(e.target.value)} 
                        className="p-2 w-full bg-tertiary text-zinc-100 font-medium rounded outline-none"
                        placeholder={`Comment on ${contact.name}`} 
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter' && !e.shiftKey)
                            {
                                e.preventDefault();
                                const messageData = `${messagetoSendContents}`;
                                setMessagetoSendContents('');
                                const res = await supabase.from('lead_comments').insert([{
                                    id: v4(),
                                    senderId: user.id,
                                    leadId: contact.id,
                                    message: messageData
                                }]);
                            }
                        }}
                    />
                    </section>
                </div>
            }
            {
                !viewComments &&
                <>
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
                </>
            }
            <div className="w-full flex flex-row justify-between">
                <button className="px-4 py-1 rounded-lg bg-secondary text-red-500 transition hover:bg-red-500 hover:text-zinc-100 font-bold mb-10"
                onClick={async () => {
                    const res = await supabase.from('leads').delete().eq('id', contactData.id);
                    console.log('deletion lead::', res);
                    if (res.status !== 204)
                    {
                        toast.error(res?.error?.message, 
                        {
                            position: "bottom-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                            style: { backgroundColor: '#090909', color: '#ef4444', fontFamily: 'Rajdhani', fontWeight: '800' }
                        });
                    }
                    else
                    {
                        toast.success('Lead Deleted Successfully.', 
                        {
                            position: "bottom-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                            style: { backgroundColor: '#00fe49', color: '#090909', fontFamily: 'Rajdhani', fontWeight: '800' }
                        });
                        router.push('/leads');
                    }
                }}>
                    Delete Lead
                </button>
                <button className="px-4 py-1 rounded-lg bg-secondary text-primary transition hover:bg-primary hover:text-secondary font-bold mb-10"
                onClick={async () => {
                    const result = await supabase.from('leads').update([
                        {
                            stage: contactData.stage,
                            initialContact: contactData.initialContact,
                            primaryElevationApproach: contactData.primaryElevationApproach,
                            secondaryElevationApproach: contactData.secondaryElevationApproach,
                            otherComments: contactData.otherComments
                        }
                    ]).eq('id', contactData.id);
                    console.log(result);
                    if (result.status === 204)
                    {
                        toast.success('Lead Updated Successfully.', 
                        {
                            position: "bottom-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                            style: { backgroundColor: '#00fe49', color: '#090909', fontFamily: 'Rajdhani', fontWeight: '800' }
                        });
                    }
                    
                }}>
                    Update Existing Lead
                </button>
            </div>
        </div>
    </div>
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
    const supabase = createServerSupabaseClient(context);
    const { data: { session }} = await supabase.auth.getSession();
    const { data, error } = await supabase.from('contacts').select(`*, leads ( id, stage, initialContact, primaryElevationApproach, secondaryElevationApproach, otherComments )`).eq('id', context.query['leadId'] as string).single();
    if (error)
    {
        return {
            redirect: {
                permanent: false,
                destination: '/500'
            }
        }
    }

    if (!data)
    {
        return {
            redirect: {
                permanent: false,
                destination: '/leads'
            }
        }
    }

    const contact = data as Lead;
    console.log('leads::', data.leads);
    contact.id = data.leads.id as string;
    contact.initialContact = data.leads.initialContact as string;
    contact.primaryElevationApproach = data.leads.primaryElevationApproach as string;
    contact.secondaryElevationApproach = data.leads.secondaryElevationApproach as string;
    contact.otherComments = data.leads.otherComments as string;
    contact.stage = data.leads.stage as LeadStage;
    contact.previewImageURL = (await supabase.storage.from('contacts.pictures').getPublicUrl(contact.previewImageURL)).data?.publicUrl ?? '';
    // console.log(contact);
    return {
        props: {
            user: session?.user,
            contact: data as Lead,
        }
    }
}