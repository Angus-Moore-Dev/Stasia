export class TaskComment
{
    id: string = '';
    created_at: string = '';
    senderId: string = '';
    replyingToId: string = '';
    message: string = '';
    ticketId!: number;
}