import { supabase } from "@/lib/supabaseClient";
import Notification from "@/models/Notification";
import { Profile } from "@/models/me/Profile";

export default async function createNewNotification(profile: Profile, title: string, description: string, previewImageURL?: string)
{
    const notification = new Notification();
    notification.title = title;
    notification.description = description;
    notification.created_at = new Date(Date.now()).toLocaleString('en-au', {timeStyle: 'medium', dateStyle: 'medium', hour12: false});
    notification.userId = profile.id;
    notification.showTo = ['*'];
    notification.pageRoute = window.location.href;
    notification.previewImageURL = previewImageURL ? previewImageURL : '';
    await supabase.from('notifications').insert(notification);
}