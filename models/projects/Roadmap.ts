export class Roadmap
{
    id!: string;
    created_at!: string;
    projectId: string = '';
    name: string = '';
    description: string = '';
    dueDate: RoadmapDueDate = RoadmapDueDate.NoDueDate;
    roadmapFeatureParentId: string = '';
}

export enum RoadmapDueDate
{
    NoDueDate = "No Due Date",
}