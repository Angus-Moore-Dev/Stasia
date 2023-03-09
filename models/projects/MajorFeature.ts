import { v4 } from "uuid";

export class MajorFeature
{
    id: string = v4();
    projectId: string = '';
    name: string = '';
    description: string = '';
    objective: string = '';
    peopleInvolved: string[] = [];
}