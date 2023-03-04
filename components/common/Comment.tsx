import Image from "next/image";
import { Comment } from "@/models/chat/Comment";
import { useState } from "react";
import Button from "./Button";
import { supabase } from "@/lib/supabaseClient";

interface CommentBoxProps
{
    comment: Comment;
}

export function CommentBox({ comment }: CommentBoxProps)
{
    const [editCommentText, setEditCommentText] = useState(comment.message);
    const [showButtons, setShowButtons] = useState(false);
    const [editComment, setEditComment] = useState(false);

    return <div className="w-full py-1 px-4 flex flex-row gap-4 transition hover:bg-tertiary rounded" onMouseOver={() => setShowButtons(true)} onMouseLeave={() => setShowButtons(false)} >
    <Image src='/profile.JPG' alt={comment.senderId} height='40' width='40' className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full object-cover" style={{ overflow: 'hidden'}} />
        <div className="w-full flex flex-col -mt-1">
            <div className="w-full flex flex-row items-center">
                <span className="text-primary font-medium pb-1 text-base">{comment.senderId} <small className="text-neutral-400 text-xs">{new Date(comment.created_at).toLocaleString('en-au', {timeStyle: 'short', dateStyle: 'short', hour12: false})}</small></span>
                {
                    showButtons && !editComment &&
                    <div className="flex-grow flex justify-end items-center gap-4 -mt-1">
                        <button className="rounded font-medium text-zinc-100 transition hover:text-primary text-xs px-2" onClick={() => {
                            setEditComment(true);
                        }}>
                            Edit
                        </button>
                        <button className="rounded font-medium text-zinc-100 transition hover:text-red-500 text-xs" onClick={async () => {
                            await supabase.from('lead_comments').delete().eq('id', comment.id);
                        }}>
                            Delete
                        </button>
                    </div>
                }
            </div>
            {
                !editComment &&
                <pre style={{ fontFamily: 'Rajdhani', display: 'inline' }} className="">
                    {
                        comment.message
                    }
                </pre>
            }
            {
                editComment &&
                <>
                    <textarea value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="bg-transparent outline-none"/>
                    <small>press <b>escape</b> to cancel, <b>enter</b> to save.</small>
                </>
            }
        </div>
    </div>
}