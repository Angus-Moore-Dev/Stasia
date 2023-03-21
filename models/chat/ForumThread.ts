export class ForumThread
{
    id!: number;
    created_at: string = new Date(Date.now()).toISOString();
    name: string = '';
    previewDescription: string = '';
    topics: string[] = [];
    creator_id: string = '';
}