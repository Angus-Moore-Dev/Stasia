export class ForumPost
{
    id!: number;
    created_at: string = new Date(Date.now()).toISOString();
    threadId: string = '';
    messageContents: string = '';
    replyingToId: string = '';
    creator_id: string = '';

    constructor(threadId: string, creatorId: string)
    {
        this.threadId = threadId;
        this.creator_id = creatorId;
    }
}