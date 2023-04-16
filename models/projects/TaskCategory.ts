import { v4 } from "uuid";

/**
 * Represents a category of tasks.
 * @class TaskCategory
 * @property {string} id - The unique identifier of the task category.
 * @property {string} name - The name of the task category.
 * @property {string} description - The description of the task category.
 * @property {string} projectId - The project this task category belongs to.
 */
export class TaskCategory
{
    /** 
     * The unique identifier of the task category.
     */
    id: string;

    /**
     * The name of the task category.
    */
    name: string = '';

    /**
     * The description of the task category.
     * @type {string}
     * @memberof TaskCategory
     * @default ''
     * @description This is optional.
     * @example 'This is a description of the task category.'
     */
    description: string = '';

    /**
     * The project this task category belongs to.
     * @type {string}
     * @memberof TaskCategory
     * @default ''
     */
    projectId: string = '';

    constructor()
    {
        this.id = v4();
    }
}