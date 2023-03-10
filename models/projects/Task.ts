import { v4 } from "uuid";

export class Task
{
    id: string = v4(); // This helps us figure out how many tickets have been created for a given project.
    name: string = '';
    description: string = '';
    projectId: string = ''; // the project this is attached to.
    majorFeatureId: string | null = null; // If attached solely to a major feature, it goes here (also will be populated for minor features too).
    minorFeatureId: string | null = null; // If attached to a minor feature, it goes here.
    assigneeId: string | null = null;
    creatorId: string | null = null;
    taskType: TaskType = TaskType.General;

    constructor(projectId: string)
    {
        this.projectId = projectId;
    }
}


export enum TaskType
{
    General = "General",
    CodeTask = "Code Task",
    DesignTask = "Design Task",
    BugFix = "Bug Fix",
    LogicFix = "Logic Fix",
    Other = "Other",
}