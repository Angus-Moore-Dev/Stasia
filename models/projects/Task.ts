export class Task
{
    id!: number; // This helps us figure out how many tickets have been created for a given project.
    name: string = '';
    created_at!: string; // This is the date the task was created. Supabase handled.
    description: string = '';
    projectId: string = ''; // the project this is attached to.
    majorFeatureId: string | null = null; // If attached solely to a major feature, it goes here (also will be populated for minor features too).
    assigneeId: string | null = null;
    creatorId: string | null = null;
    taskType: TaskType = TaskType.General;
    taskState: TaskState= TaskState.NotStarted;
    onBoard: boolean = false;
    important: boolean = false;
    categoryId!: string; // The category this task belongs to.
    position: number; // The position of this task on the board.

    constructor(projectId: string)
    {
        this.projectId = projectId;
        this.position = 0;
    }
}


export enum TaskState
{
    NotStarted = "Not Started",
    InProgress = "In Progress",
    RequiresReview = "Requires Review", // In the event this requires another user to review.
    Completed = "Completed",
    Archived = "Archived" // For when a ticket has been completed and is no longer on the page (viewable and useable for statistics)
}


export enum TaskType
{
    General = "General",
    CodeTask = "Code Task",
    DesignTask = "Design Task",
    BugFix = "Bug Fix",
    LogicFix = "Logic Fix",
    Research = "Research",
    Investigate = "Investigation",
    Planning = "Planning",
    Other = "Other",
}