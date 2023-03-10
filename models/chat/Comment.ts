export class Comment
{
    id: string = '';
    created_at: string = '';
    senderId: string = '';
    leadId: string = ''; // for lead comments
    contactId: string = ''; // for contact comments
    replyingToId: string = '';
    message: string = '';

    // This is for injecting the profile data.
    name: string = '';
    publicProfileURL: string = '';
}