import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import LoadingBox from "./LoadingBox";
import Button from "./common/Button";
import { v4 } from "uuid";
import { useRouter } from "next/router";
import Image from "next/image";
import Notification from "@/models/Notification";
import { supabase } from "@/lib/supabaseClient";
import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';
import { Profile } from "@/models/me/Profile";
import { useClickAway } from "react-use";

interface NotificationMenuProps
{
    profile: Profile;
}

export default function NotificationMenu({ profile }: NotificationMenuProps)
{
    const ref = useRef<HTMLButtonElement>(null);
    useClickAway(ref, () => setShowNotificationMenu(false));
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const [unseenNotificationCount, setUnseenNotificationCount] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const fetchAllNotifications = async () =>
    {
        const notifications = (await supabase.from('notifications').select('*').order('created_at', { ascending: false })).data as Notification[];
        setNotifications(notifications);
    }

    useEffect(() => {
        fetchAllNotifications();
        supabase.channel('notificationUpdates')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(notifications => [newNotification, ...notifications ?? [],]);
            // Coming from someone other than ourselves.
            if (newNotification.userId !== profile.id)
            {
                setUnseenNotificationCount(true);
                audioRef.current!.volume = 0.25;
                audioRef.current?.play();
            }
        }).subscribe((status) => console.log('notification listener::', status));
    }, []);

    useEffect(() => {
        if (showNotificationMenu)
        {
            setUnseenNotificationCount(false);
            setNotifications(notifications => notifications.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        }
    }, [showNotificationMenu]);

    useEffect(() => {
        if (unseenNotificationCount)
        {
            setNotifications(notifications => notifications?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        }
    }, [unseenNotificationCount]);


    return <>
        <audio hidden ref={audioRef}>
            <source src='/notificationSound.mp3' />
        </audio>
        <button ref={ref}
        className="text-zinc-100 transition hover:text-primary mr-10 hidden md:flex aria-checked:text-primary"
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
                <span className="px-4 font-medium">Notifications</span>
                {
                    notifications.length === 0 &&
                    <div className="flex-grow flex items-center justify-center">
                        <LoadingBox />
                    </div>
                }
                {
                    notifications.length > 0 &&
                    <div className="flex-grow  flex flex-col overflow-y-auto scrollbar">
                        <div className="flex-grow flex flex-col gap-1">
                        <span>Today</span>
                        {
                            notifications.filter(x => Math.floor(Math.abs(Date.now() - new Date(x.created_at).getTime()) / 36e5) < 24)
                            .map(notification => <div key={notification.id}><NotificationEvent notification={notification} setShowNotificationMenu={setShowNotificationMenu} /></div>)
                        }
                        <span>Less Than A Week Ago</span>
                        {
                            notifications.filter(x => Math.floor(Math.abs(Date.now() - new Date(x.created_at).getTime()) / 36e5) > 24 && Math.floor(Math.abs(Date.now() - new Date(x.created_at).getTime()) / 36e5) < 144)
                            .map(notification => <div key={notification.id}><NotificationEvent notification={notification} setShowNotificationMenu={setShowNotificationMenu} /></div>)
                        }
                        <span>A Week Ago</span>
                        {
                            notifications.filter(x => Math.floor(Math.abs(Date.now() - new Date(x.created_at).getTime()) / 36e5) > 144 && Math.floor(Math.abs(Date.now() - new Date(x.created_at).getTime()) / 36e5) < (30 * 24))
                            .map(notification => <div key={notification.id}><NotificationEvent notification={notification} setShowNotificationMenu={setShowNotificationMenu} /></div>)
                        }
                        <span>Old Notifications</span>
                        {
                            notifications.filter(x => Math.floor(Math.abs(Date.now() - new Date(x.created_at).getTime()) / 36e5) > 720)
                            .map(notification => <div key={notification.id}><NotificationEvent notification={notification} setShowNotificationMenu={setShowNotificationMenu} /></div>)
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