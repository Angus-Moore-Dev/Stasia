/**
 * A model for receiving Google Calendar API events, so that 
 * people may more easily interact with their events on Stasia.
 */
export class Event
{
    id: string = ''
    summary: string = '';
    description: string = '';
    location: string = '';
    created: string = ''; // ISO String
    start: { dateTime: string, timeZone: string } = { dateTime: '', timeZone: '' };
    end: { dateTime: string, timeZone: string } = { dateTime: '', timeZone: '' };
    organizer: {
        email: string,
        displayName: string,
    } = { email: '', displayName: ''};
    attendees: { 
        email: string, 
        organizer: boolean, 
        self: boolean, 
        responseStatus: "needsAction" | 'declined' | 'tenative' | 'accepted',
    }[] = [];
}