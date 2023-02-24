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
    console.log(chat);
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            {
                chat &&
                chat.map(message => 
                    <div>
                        <br />
                        <p>{message.name} That is a user id</p>
                        <small>Sent at: {new Date(Date.parse(message.created_at)).toLocaleDateString('en-au', { second: 'numeric', minute: 'numeric', hour: 'numeric' })}</small>
                        <p>{message.message}</p>
                    </div>
                )
            }
        </div>
    )
}


export const getServerSideProps = async () => {
    const { data, error} = await supabase.from('chat').select('*');
    console.log(data);
    return {
        props: {
            chat: data as ChatMessage[]
        }
    }
}
