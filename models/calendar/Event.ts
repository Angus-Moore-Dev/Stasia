import { v4 } from "uuid";

export class Event
{
    id: string;
    title: string = '';
    description: string = '';
    location: string = '';
    peopleInvolved: string[] = [];
    date: Date = new Date(Date.now());

    constructor()
    {
        this.id = v4();
    }
}