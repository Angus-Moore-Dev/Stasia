import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";

interface ChatMessage
{
    id: string;
    created_at: string;
    name: string; 
    message: string;
    leadId: string;
}

interface LeadsPageProps
{
    chat: ChatMessage[];
}

export default function LeadsPage({ chat }: LeadsPageProps)
{
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            {
                chat.map(message => 
                    <div key={message.id}>
                        <br />
                        <p>{message.name} That is a user id</p>
                        <small>Sent at: {message.created_at}</small>
                        <p>{message.message}</p>
                    </div>
                )
            }
        </div>
    )
}


export const getServerSideProps = async () => {
    const { data, error} = await supabase.from('chat').select('*');

    const chatData = data as ChatMessage[];
    for (const chat of chatData)
    {
        chat.created_at = new Date(chat.created_at).toLocaleString();
    }
    return {
        props: {
            chat: chatData
        }
    }
}
