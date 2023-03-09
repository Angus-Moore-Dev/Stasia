import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import LoadingBox from "./LoadingBox";
import Button from "./common/Button";
import { v4 } from "uuid";
import { useRouter } from "next/router";
import Image from "next/image";
import Notification from "@/models/Notification";
import { supabase } from "@/lib/supabaseClient";
import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';
import { Profile } from "@/models/me/Profile";

interface NotificationMenuProps
{
    profile: Profile;
}

export default function NotificationMenu({ profile }: NotificationMenuProps)
{
    const [notifications, setNotifications] = useState<Notification[]>();
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const [unseenNotificationCount, setUnseenNotificationCount] = useState(false);
    const [oldNotifications, setOldNotifications] = useState<Notification[]>();

    const updateMessage = useCallback((notification: Notification) => 
    {
        console.log('updating notifications');
        setUnseenNotificationCount(true);
        setNotifications(notififcations => [...notififcations?? [], notification]);
    }, []);

    const fetchAllNotifications = async () =>
    {
        const notifications = (await supabase.from('notifications').select('*').contains('showTo', ['*']).not('seenIds', 'cs', `{${profile.id}}`)).data as Notification[];
        setNotifications(notifications);
        const oldNotifications = (await supabase.from('notifications').select('*').contains('showTo', ['*']).contains('seenIds', [profile.id])).data as Notification[];
        setOldNotifications(oldNotifications);
    }

    useEffect(() => {
        const channel = supabase.channel('table-db-changes')
        .on('postgres_changes', {event: '*', schema: 'public', table: 'notifications'}, async (payload) => 
        {
            console.log('new notification!');
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
            console.log('notification sub status', status);
            if (status === 'CLOSED')
            {
                // channel.subscribe();
            }
        });
        fetchAllNotifications();
    }, []);


    useEffect(() => {
        if (notifications && !showNotificationMenu)
        {
            for (const notification of notifications)
            {
                if (!notification.seenIds.some(x => x === profile.id))
                {
                    setUnseenNotificationCount(true);
                    break;
                }
            }
        }
    }, [notifications]);


    useEffect(() => 
    {
        if (showNotificationMenu)
        {
            const setNotificationsAsSeen = async () =>
            {
                if (notifications)
                {
                    for (const notification of notifications)
                    {
                        if (!notification.seenIds.some(x => x === profile.id))
                        {
                            console.log('setting notifcations to seen');
                            const updatedNotification = notification;
                            updatedNotification.seenIds.push(profile.id);
                            const res = await supabase.from('notifications').update([updatedNotification]).eq('id', notification.id);
                            if (res.error)
                            {
                                console.log(res.error);
                            }
                        }
                    }
                }
            }
            setNotificationsAsSeen();
            fetchAllNotifications();
            setUnseenNotificationCount(false);
        }
    }, [showNotificationMenu]);


    return <>
        <button className="text-zinc-100 transition hover:text-primary mr-10 hidden md:flex aria-checked:text-primary"
        aria-checked={showNotificationMenu}
        onClick={() => setShowNotificationMenu(!showNotificationMenu)}>
            {
                unseenNotificationCount &&
                <div className="w-10 h-4 absolute top-2 ml-3 bg-red-500 text-zinc-100 font-bold flex items-center justify-center text-xs rounded">
                    new
                </div>
            }
            <VisibilitySharpIcon fontSize="small" />
        </button>
        {
            showNotificationMenu &&
            <div className="w-96 min-h-[384px] max-h-[50vh] bg-quaternary rounded absolute z-50 top-12 mr-36 p-2 flex flex-col gap-1">
                <span className="px-4 font-medium">Notifications This Session</span>
                {
                    !notifications &&
                    <div className="flex-grow flex items-center justify-center">
                        <LoadingBox />
                    </div>
                }
                {
                    notifications &&
                    <div className="flex-grow  flex flex-col overflow-y-auto scrollbar">
                        <div className="flex-grow flex flex-col gap-1">
                        {
                            notifications.length === 0 && (!oldNotifications || oldNotifications && oldNotifications.length === 0) &&
                            <div className="flex-grow flex items-center justify-center">
                                No New Notifications.
                            </div>
                        }
                        {
                            notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(notification => <div key={notification.id}><NotificationEvent notification={notification} setShowNotificationMenu={setShowNotificationMenu} /></div>)
                        }
                        {
                            oldNotifications && oldNotifications.length > 0 &&
                            <span className="mt-4 border-t-2 border-t-primary">
                                Old Notifications (Previous Sessions)
                            </span>
                        }
                        {
                            oldNotifications &&
                            oldNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(notification => <div key={notification.id}><NotificationEvent notification={notification} setShowNotificationMenu={setShowNotificationMenu} /></div>)
                        }
                        </div>
                    </div>
                }
                <Button text='Close Menu' onClick={() => setShowNotificationMenu(false)} />
            </div>
        }
    </>
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