import { v4 } from "uuid";

export default class Notification
{
    id: string = v4();
    title: string = '';
    description: string = '';
    created_at: string = '';
    previewImageURL: string = '';
    pageRoute: string = ''; // So that when the user clicks on it, they are directed to it.
    userId: string = ''; // the id of the profile that created this notification.
    showTo: string[] = []; // list of userIds to show this event to. If all, then it will be ['*']
    seenIds: string[] = []; // list of userIds who have seen this, so we ignore. If all have seen, then the last user to see it will delete it from the db.
}