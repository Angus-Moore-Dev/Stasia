import { Contact } from "@/models/Contact";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { Suspense, useCallback, useEffect, useState } from "react";
import Image from 'next/image';
import EmailSharpIcon from '@mui/icons-material/EmailSharp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocalPhoneSharpIcon from '@mui/icons-material/LocalPhoneSharp';
import BusinessSharpIcon from '@mui/icons-material/BusinessSharp';
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import LoadingBox from "@/components/LoadingBox";
import { ContactCommentBox } from "@/components/common/Comment";
import { v4 } from "uuid";
import { Comment } from '@/models/chat/Comment';
import { Profile } from "@/models/me/Profile";
interface SpecificContactPageProps
{
    user: User;
    contact: Contact;
}


export default function SpecificContactPage({ user, contact }: SpecificContactPageProps)
{
    const [imagePreview, setImagePreview] = useState('');
    const [name, setName] = useState(contact.name);
    const [shortDescription, setShortDescription] = useState(contact.description);
    const [selectedType, setSelectedType] = useState<number | undefined>();
    const [commentProfileInfo, setCommentProfileInfo] = useState<{id: string, name: string, profilePictureURL: string}[]>();

    // for comments
    const [messagetoSendContents, setMessagetoSendContents] = useState('');
    const [comments, setComments] = useState<Comment[]>();
    const [commentsIsLoading, setCommentsIsLoading] = useState(true);
    const updateMessage = useCallback(async (comment: Comment) => 
    {
        setComments(comments => [...comments ?? [], comment]);
    }, []);
    const removeMessage = useCallback(async (id: string) => 
    {
        setComments(comments => [...comments?.filter(x => x.id !== id) ?? []]);
    }, []);


    useEffect(() => {
        if (comments)
        {
            const checkMessages = async () =>
            {
                 // Now we get all the users that have commented on this.
                if (!commentProfileInfo?.some(x => x.id === comments.find(comment => comment.senderId === x.id)?.senderId))
                {
                    const commentProfileData = await supabase.from('profiles').select(`id, name, profilePictureURL`).in('id', [...comments.map(x => x.senderId)]);
                    const profiles = commentProfileData.data as unknown as Profile[];
                    for (const comment of profiles ?? [])
                    {
                        comment.profilePictureURL = supabase.storage.from('profile.pictures').getPublicUrl(comment.profilePictureURL).data.publicUrl ?? '';
                    }
                    console.log('profile info::', profiles);
                    setCommentProfileInfo(profiles);
                }
            }
            checkMessages();
        }
    }, [comments]);


    useEffect(() => {
        if (selectedType === 2)
        {
            const fetchComments = async() => 
            {
                if (!comments)
                {
                    const { data, error } = await supabase.from('contact_comments').select('*').eq('contactId', contact.id);
                    const comments =  data as Comment[];
                    setComments(comments);
                    setCommentsIsLoading(false);
                    const channel = supabase.channel('table-db-changes')
                    .on('postgres_changes', {event: '*', schema: 'public', table: 'contact_comments'}, async (payload) => 
                    {
                        console.log(payload);
                        if (payload.eventType === 'INSERT')
                        {
                            const message = payload.new as Comment;
                            if (message.contactId === contact.id)
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
                            // channel.subscribe();
                        }
                    });
                }
            }
            fetchComments();
        }
    }, [selectedType]);


    useEffect(() => {
        console.log('commentProfileInfo::', commentProfileInfo);
    }, [commentProfileInfo]);

    return <div className="w-full h-full flex flex-col items-center justify-start gap-4 max-w-[1920px] p-8 mx-auto">
        <div className="w-full flex flex-row justify-between">
        <Link href='/contacts' className="px-2 py-1 rounded-lg transition hover:bg-primary font-semibold hover:text-secondary">Back to Contacts</Link>
        <Link href={`/contacts/edit?id=${contact.id}`} className="px-2 py-1 rounded-lg transition hover:bg-primary font-semibold hover:text-secondary">Edit Contact</Link>
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
                        {name}
                    </p>
                    <div className="w-full flex flex-col">
                        <textarea value={shortDescription}
                        readOnly={true}
                        className="px-2 pb-2 pt-4 bg-transparent text-zinc-100 outline-none font-medium w-2/3 h-[250px] max-h-[250px] min-h-[250px] scrollbar" placeholder="short description" />
                    </div>
                </div>
            </section>
        </div>
        <div className="flex flex-col gap-2 mx-auto max-w-6xl w-full">
            {
                contact.organisations.length > 0 && contact.organisations.filter(x => x !== '').length > 0 &&
                <div className="flex flex-row gap-2 items-center relative">
                    <span className="text-primary h-full"><BusinessSharpIcon fontSize="small" /></span>
                    <div className="flex flex-col flex-wrap gap-[2p1] w-64">
                    {
                        contact.organisations.map(organisation => <span key={organisation} className="font-medium">{organisation}</span>)
                    }
                    </div>
                </div>
            }
            {
                contact.email &&
                <div className="flex flex-row gap-2 items-center">
                    <span className="text-primary"><EmailSharpIcon fontSize="small" /></span>
                    <span className="font-medium">{contact.email}</span>
                </div>
            }
            {
                contact.phoneNumber &&
                <div className="flex flex-row gap-2 items-center">
                    <span className="text-primary"><LocalPhoneSharpIcon fontSize="small" /></span>
                    <span className="font-medium">{contact.phoneNumber}</span>
                </div>
            }
            {
                contact.linkedInURL &&
                <div className="flex flex-row gap-2 items-center">
                    <span className="text-primary"><LinkedInIcon fontSize="small" /></span>
                    <Link href={contact.linkedInURL} target="_blank" className="font-medium transition hover:text-primary">{contact.linkedInURL}</Link>
                </div>
            }
            {
                contact.location &&
                <span className="font-medium text-neutral-300">{contact.location}</span>
            }
        </div>
        <div className="flex-grow w-full max-w-6xl flex flex-col gap-2">
            <section className="w-full h-10 flex flex-row gap-2">
                <button className="w-64 rounded bg-tertiary text-zinc-100 font-medium transition hover:bg-primary hover:text-secondary aria-selected:bg-primary aria-selected:text-secondary aria-selected:font-semibold"
                aria-selected={selectedType === 1} onClick={() => setSelectedType(1)}>
                    Calender/Events
                </button>
                <button className="w-64 rounded bg-tertiary text-zinc-100 font-medium transition hover:bg-primary hover:text-secondary aria-selected:bg-primary aria-selected:text-secondary aria-selected:font-semibold"
                aria-selected={selectedType === 2} onClick={() => setSelectedType(2)}>
                    Comments
                </button>
            </section>
            <section className="flex-grow flex">
                {
                    selectedType === undefined &&
                    <div className="flex-grow h-full flex flex-col items-center justify-center">
                        Select a category for more
                    </div>
                }
                {
                    selectedType === 1 &&
                    <div className="flex-grow h-full flex flex-col items-center justify-center">
                        Calendar/Events
                    </div>
                }
                {
                    selectedType === 2 &&
                    <div className="w-full flex-grow flex flex-col">
                        <section className="flex-grow flex flex-col gap-1 overflow-y-auto max-h-[30vh] scrollbar mb-4">
                            {
                                commentsIsLoading && (!commentProfileInfo || commentProfileInfo.length === 0) &&
                                <div className="flex-grow flex items-center justify-center">
                                    <LoadingBox />
                                </div>
                            }
                            {
                                comments && comments.length > 0 && !commentsIsLoading && commentProfileInfo && commentProfileInfo.length > 0 && 
                                comments.map(comment => <div key={comment.id}><ContactCommentBox comment={comment} profile={commentProfileInfo.find(x => x.id === comment.senderId) as Profile} /></div>)
                            }
                            {
                                comments && comments.length === 0 && !commentsIsLoading && (!commentProfileInfo || commentProfileInfo.length === 0) &&
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
                                    const res = await supabase.from('contact_comments').insert([{
                                        senderId: user.id,
                                        contactId: contact.id,
                                        message: messageData
                                    }]);

                                    if (res.error)
                                    {
                                        console.log(res.error);
                                    }
                                }
                            }}
                        />
                        </section>
                    </div>
                }
            </section>
        </div>
    </div>
}


export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
    const supabase = createServerSupabaseClient(context);
    const { data: { session }} = await supabase.auth.getSession();
    if (!session)
    {
        return {
            redirect: {
                destination: '/sign-in',
                permanent: false
            }
        }
    }
    const { data, error } = await supabase.from('contacts').select("*").eq('id', context.query['contactId'] as string).single();
    const contact = data as Contact;
    contact.previewImageURL = (await supabase.storage.from('contacts.pictures').getPublicUrl(contact.previewImageURL)).data?.publicUrl ?? '';

    return {
        props: {
            user: session?.user,
            contact: data as Contact,
        }
    }
}