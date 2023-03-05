import MessageBox from "@/components/common/Message";
import { supabase } from "@/lib/supabaseClient";
import { Message } from "@/models/chat/Message";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { RealtimeChannel, User } from "@supabase/supabase-js";
import { channel } from "diagnostics_channel";
import { GetServerSidePropsContext } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";

interface ChatPageProps
{
    user: User;
}


export default function ChatPage({ user }: ChatPageProps)
{
    
    const [selectedChannelId, setSelectedChannelId] = useState('5fdf6565-26ff-4e3f-b033-445ba003e005');
    const [selectedChannelName, setSelectedChannelName] = useState('#general');
    const [messagetoSendContents, setMessagetoSendContents] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [firstLoad, setFirstLoad] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const endOfChatRef = useRef<HTMLDivElement>(null);

    const updateMessage = useCallback((message: Message) => {
        setMessages(messages => [...messages, message]);
    }, []);

    useEffect(() => {
        console.log('user::', user);
        const setupFunc = async () => 
        {
            // Let in the messages.
            const { data , error } = await supabase.from('messages').select('*');
            setMessages(data as Message[]);
            // setup listening to inserts on the event
        }
        const channel = supabase.channel('table-db-changes')
        .on('postgres_changes', {event: '*', schema: 'public', table: 'messages'}, (payload) => {
            const message = payload.new as Message;
            if (message.channelId === selectedChannelId)
            {
                // ADD THIS MESSAGE ONTO THE LIST!
                updateMessage(message);
            }
            else
            {
                // find the channel that this is in, and put a notification button next to it.
            }
        }).subscribe((status) => {
            console.log(status);
            if (status === 'TIMED_OUT')
            {
                // TODO: Renew subscription.
                
            }
            else if (status === 'CLOSED')
            {
                // channel.subscribe();
            }
        });
        setupFunc();
        endOfChatRef.current?.scrollIntoView({ behavior: 'auto' });
        return () => {}
    }, []);

    useEffect(() => {
        if (messages && firstLoad)
        {
            endOfChatRef.current?.scrollIntoView({ behavior: 'auto' });
            setFirstLoad(false);
        }
    }, [messages]);

    return <div className='w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto'>
        <section className="w-full flex justify-between">
            <span className="">Chat</span>
        </section>
        <section className="flex-grow max-h-full flex flex-row w-full">
            <div className="w-1/4 bg-tertiary rounded-l py-8 px-4">
                <div className="w-full flex justify-between pr-2 ">
                    <span>Channels</span>
                    <button className="text-2xl font-semibold">+</button>
                </div>
                <button className="w-full px-4 py-1 text-lg font-semibold rounded-lg transition hover:bg-primary hover:text-secondary text-left"
                onClick={() => {setSelectedChannelId(v4())}}>
                    # general
                </button>
            </div>
            <div className="w-3/4 bg-quaternary rounded-r flex-grow flex flex-col overflow-y-auto scrollbar">
                <div className="h-14 w-full flex flex-row px-8 items-center bg-tertiary border-l-secondary border-l-4">
                    <p>{selectedChannelName}</p>
                </div>
                <div className="flex-grow flex flex-col gap-2 overflow-y-auto scrollbar max-h-fit py-2" id='ChatWindow'>
                    {
                        messages.map(message => <div ref={endOfChatRef} key={message.id}><MessageBox message={message} /></div>)
                    }
                </div>
                <div className="h-24 w-full px-8 flex flex-row gap-2 items-center">
                    <input 
                    ref={inputRef}
                    value={messagetoSendContents} 
                    onChange={(e) => setMessagetoSendContents(e.target.value)} 
                    className="p-2 w-full bg-secondary text-zinc-100 font-medium rounded outline-none" 
                    placeholder={`Message ${selectedChannelName}`} 
                    onKeyDown={async (e) => {
                        if (e.key === 'Enter')
                        {
                            const res = await supabase.from('messages').insert([{
                                id: v4(),
                                senderId: user.id,
                                channelId: selectedChannelId,
                                message: messagetoSendContents
                            }]);
                            setMessagetoSendContents('');
                            endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    />
                </div>
            </div>
        </section>
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
	return {
		props: {
			user: session?.user ?? null
		}
	}
}