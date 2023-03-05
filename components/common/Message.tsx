import { supabase } from "@/lib/supabaseClient";
import { Comment } from "@/models/chat/Comment";
import { Message } from "@/models/chat/Message";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { useEffect, useState } from "react";

interface MessageBoxProps
{
    message: Message;
}

export default function MessageBox({ message }: MessageBoxProps)
{
    const [user, setUser] = useState<User>();

    return <div className="w-full py-1 px-4 flex flex-row gap-4">
        <Image src='/profile.JPG' alt={message.senderId} height='40' width='40' className="w-10 h-10 min-w-[40px] min-h-[40px] rounded object-cover" style={{ overflow: 'hidden'}} />
        <div className="flex flex-col -mt-1">
            <span className="text-primary font-medium pb-1 text-base">{message.senderId} <small className="text-neutral-400 text-xs">{new Date(message.created_at).toLocaleString('en-au', {timeStyle: 'short', dateStyle: 'short', hour12: false})}</small></span>
            <pre style={{ fontFamily: 'Rajdhani', display: 'inline' }} className="">
                {
                    message.message
                }
            </pre>
        </div>
    </div>
}