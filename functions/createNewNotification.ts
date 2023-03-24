import { supabase } from "@/lib/supabaseClient";
import Notification from "@/models/Notification";
import { Profile } from "@/models/me/Profile";

/**
 * The heart of telling everyone else in the organisation of a change that you created.
 * @param profile the profile object of the person who created this notification
 * @param title the title of the notification
 * @param description a short description of the changes
 * @param previewImageURL the full URL of the person/profile/icon that is required for the image (no bucket name, the https://*.supabase.co/{bucket}/{file_name and path})
 */
export default async function createNewNotification(profile: Profile, title: string, description: string, previewImageURL?: string)
{
    const notification = new Notification();
    notification.title = title;
    notification.description = description;
    notification.created_at = new Date(Date.now()).toLocaleString('en-au', {timeStyle: 'medium', dateStyle: 'medium', hour12: false});
    notification.userId = profile.id;
    notification.showTo = ['*'];
    notification.pageRoute = window.location.pathname;
    notification.previewImageURL = previewImageURL ? previewImageURL : '';
    await supabase.from('notifications').insert(notification);
}