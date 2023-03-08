import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import LoadingBox from "./LoadingBox";
import Button from "./common/Button";
import { v4 } from "uuid";
import { useRouter } from "next/router";
import Image from "next/image";
import Notification from "@/models/Notification";
import { supabase } from "@/lib/supabaseClient";

interface NotificationMenuProps
{
    setShowNotificationMenu: Dispatch<SetStateAction<boolean>>;
}

export default function NotificationMenu({ setShowNotificationMenu }: NotificationMenuProps)
{
    const [isLoading, setIsLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>();
    const updateMessage = useCallback((notification: Notification) => 
    {
        setNotifications(notififcations => [...notififcations?? [], notification]);
    }, []);
    const removeMessage = useCallback((id: string) => 
    {
        setNotifications(notififcations => [...notififcations?.filter(x => x.id !== id) ?? []]);
    }, []);

    useEffect(() => {
        const fetchAllNotifications = async () =>
        {
            setNotifications((await supabase.from('notifications').select('*')).data as Notification[]);
            const channel = supabase.channel('table-db-changes')
            .on('postgres_changes', {event: '*', schema: 'public', table: 'notifications'}, async (payload) => 
            {
                // We're only listening to new ones.
                if (payload.eventType === 'INSERT')
                {
                    const notification = payload.new as Notification;
                    if (notification.showTo.length === 1 && notification.showTo[0] === '*')
                    {
                        updateMessage(notification);
                    }
                }
            }).subscribe((status) => {
                console.log(status);
                if (status === 'CLOSED')
                {
                    // channel.subscribe();
                }
            });
        }
        fetchAllNotifications();
    }, []);

    return <div className="w-96 min-h-[384px] max-h-[50vh] bg-quaternary rounded absolute z-50 top-12 mr-36 p-2 flex flex-col gap-1">
        <span className="px-4 font-medium">Notifications</span>
        {
            !notifications &&
            <div className="flex-grow flex items-center justify-center">
                <LoadingBox />
            </div>
        }
        {
            notifications &&
            <div className="flex-grow flex flex-col overflow-y-auto scrollbar">
                <div className="flex-grow flex flex-col gap-1">
                {
                    notifications.map(notification => <NotificationEvent notification={notification} setShowNotificationMenu={setShowNotificationMenu} />)
                }
                </div>
            </div>
        }
        <Button text='Close Menu' onClick={() => setShowNotificationMenu(false)} />
    </div>
}


interface NotificationEventProps
{
    notification: Notification;
    setShowNotificationMenu: Dispatch<SetStateAction<boolean>>;

}

function NotificationEvent({ notification, setShowNotificationMenu }: NotificationEventProps)
{
    const router = useRouter();
    return <div className="group w-full p-2 bg-tertiary rounded transition hover:bg-primary hover:text-secondary hover:cursor-pointer flex flex-row gap-4" onClick={() => {
        setShowNotificationMenu(false);
        router.push(notification.pageRoute);
    }}>
        <Image src={notification.previewImageURL ? notification.previewImageURL : '/milton.gif'} alt='logo' width='50' height='50' className="object-cover rounded max-w-[50px] max-h-[50px]" />
        <div className="flex-grow flex flex-col">
            <small className="text-sm font-semibold pb-2">{notification.title}</small>
            <small className="font-medium text-xs">{notification.description}</small>
            <div className="flex flex-row justify-between">
                <small className="text-xs pt-2 text-zinc-400 group-hover:text-secondary group-hover:font-bold">Click to Open</small>
                <small className="text-xs pt-2 text-zinc-400 group-hover:text-secondary">{notification.created_at}</small>
            </div>
        </div>
    </div>
}