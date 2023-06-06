import LoadingBox from "@/components/LoadingBox";
import Button from "@/components/common/Button";
import { DiscussionBox } from "@/components/common/Comment";
import createToast from "@/functions/createToast";
import { supabase } from "@/lib/supabaseClient";
import { Comment } from "@/models/chat/Comment";
import { DiscussionMessage } from "@/models/chat/DiscussionMessage";
import { Profile } from "@/models/me/Profile";
import { Project } from "@/models/projects/Project";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

interface ProjectDiscussionProps
{
    user: User;
    project: Project;
}

export default function ProjectDiscussion({ user, project }: ProjectDiscussionProps)
{
    const router = useRouter();
    const [messageContents, setMessageContents] = useState('');
    const [messages, setMessages] = useState<DiscussionMessage[]>();
    const [disableMessage, setDisableMessage] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);

    // Send the message to the project messages.
    const sendMessage = async () =>
    {
        const res = await supabase.from('project_discussion').insert({
            projectId: project.id,
            senderId: user.id,
            message: messageContents,
            id: v4()
        });
        if (res.error)
        {
            createToast(res.error.message, true);
        }
        else
        {
            setMessageContents('');
        }
    }

    useEffect(() => {
        supabase.from('project_discussion').select('*').eq('projectId', project.id).then(async res => {
            if (res.error)
            {
                createToast(res.error.message, true);
            }
            else
            {
                for (const message of res.data as DiscussionMessage[])
                {
                    if (!profiles.some(x => x.id === message.senderId))
                    {
                        const profile = await supabase.from('profiles').select('*').eq('id', message.senderId).single();
                        if (profile.error)
                        {
                            createToast(profile.error.message, true);
                        }
                        else
                        {
                            const userProfile = profile.data as Profile;
                            userProfile.profilePictureURL = supabase.storage.from('profile.pictures').getPublicUrl(userProfile.profilePictureURL).data.publicUrl;
                            setProfiles(prev => [...prev, userProfile]);
                        }
                    }
                }
                setMessages(res.data as DiscussionMessage[]);
            }
        });


        const subscription = supabase.channel(`${project.id}-project_discussion`).on('postgres_changes', { event: '*', schema: 'public', table: 'project_discussion' }, async (payload) => {
            if (payload.eventType === 'INSERT')
            {
                if (payload.new)
                {
                    const message = payload.new as DiscussionMessage;
                    if (message.projectId === project.id)
                    {
                        if (!profiles.some(x => x.id === message.senderId))
                        {
                            const profile = await supabase.from('profiles').select('*').eq('id', message.senderId).single();
                            if (profile.error)
                            {
                                createToast(profile.error.message, true);
                            }
                            else
                            {
                                const userProfile = profile.data as Profile;
                                userProfile.profilePictureURL = supabase.storage.from('profile.pictures').getPublicUrl(userProfile.profilePictureURL).data.publicUrl;
                                setProfiles(prev => [...prev, userProfile]);
                            }
                        }
                        setMessages(prev => [...prev ?? [], message]);
                    }
                }
            }
            else if (payload.eventType === 'UPDATE')
            {
                if (payload.new)
                {
                    const message = payload.new as DiscussionMessage;
                    if (message.projectId === project.id)
                    {
                        setMessages(prev => prev?.map(x => x.id === message.id ? message : x));
                    }
                }
            }
            else if (payload.eventType === 'DELETE')
            {
                setMessages(prev => prev?.filter(x => x.id !== payload.old.id));
            }
        }).subscribe((status) => {
            if (status !== 'SUBSCRIBED')
            {
                setDisableMessage(true);
            }
            else if (status === 'SUBSCRIBED')
            {
                setDisableMessage(false);
            }
        });

        // Now we subscribe to anyone that wants to join the channel.
        // supabase.channel(`${project.id}-project_presence`).on('presence', { event: 'join' }, ({ key, newPresences }) => {
        //     console.log(key, newPresences)
        // })
        // .subscribe()
    }, []);

    return <div className="w-full h-full min-h-full flex flex-col items-center gap-4 p-8 mx-auto max-w-[1920px]">
        <Button text={`Back to ${project.name}`} onClick={() => {
            router.push(`/projects/${project.id}`);
        }} className="mr-auto" />
        <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col gap-1">
                <span className="text-4xl font-semibold">{project.name} Discussion</span>
            </div>
        </div>
        <div className="flex-grow w-full flex flex-col rounded-md bg-tertiary">
            <div className="flex-grow p-4">
                {
                    !messages &&
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <LoadingBox />
                        <small>Loading Messages</small>
                    </div>
                }
                {
                    messages && messages.length === 0 &&
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <span>No Messages, Yet.</span>
                    </div>
                }
                {
                    messages && messages.length > 0 &&
                    <div className="w-full h-full flex flex-col gap-2">
                        {
                            messages.map((message, index) => <DiscussionBox key={index} comment={message} profile={profiles.find(x => x.id === message.senderId)!} me={user.id} />)
                        }
                    </div>
                }
            </div>
            <div className="w-full flex flex-row items-center justify-center p-4">
                <div className="flex flex-col w-full gap-1">
                    {
                        disableMessage &&
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <span>Reconnecting to the Server...</span>
                        </div>
                    }
                    {
                        !disableMessage &&
                        <>
                        <textarea 
                        value={messageContents}
                        onChange={(e) => setMessageContents(e.target.value)}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter')
                            {
                                e.preventDefault();
                                // Send message.
                                await sendMessage();
                            }
                        }}
                        className="w-full rounded-md p-4 bg-secondary outline-none resize-none scrollbar" 
                        placeholder="Send Message Here" />
                        <small className="ml-auto">Press <b>Enter</b> to Send.</small>
                        </>
                    }
                </div>
            </div>
        </div>
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

    const project = (await supabaseClient.from('projects').select('*').eq('id', context.query['projectId']).single()).data as Project;

    return {
        props: {
            user: session.user,
            project
        }
    }
}