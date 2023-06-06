export class DiscussionMessage
{
    id: string = '';
    created_at: string = '';
    senderId: string = '';
    contactId: string = ''; // for contact comments
    replyingToId: string = '';
    message: string = '';
    projectId: string = '';
}