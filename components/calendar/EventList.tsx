import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useClickAway } from "react-use";
import Button from "../common/Button";
import AddBoxSharpIcon from '@mui/icons-material/AddBoxSharp';
import { supabase } from "@/lib/supabaseClient";
import { Event } from "@/models/calendar/Event";
import LoadingBox from "../LoadingBox";
import KeyboardBackspaceSharpIcon from '@mui/icons-material/KeyboardBackspaceSharp';
import PersonAddAltSharpIcon from '@mui/icons-material/PersonAddAltSharp';

interface EventListProps
{
    monthNumber: number;
    monthText: string;
    day: number;
    id: string;
    currentlySelectedId: string;
    setCurrentlySelectedId: Dispatch<SetStateAction<string>>;
}

export default function EventList({ monthNumber, monthText, day, id, currentlySelectedId, setCurrentlySelectedId }: EventListProps)
{
    const ref = useRef<HTMLDivElement>(null);
    const [offset, setoffset] = useState('right-12');
    const [heightOffset, setHeightOffset] = useState('top-0');
    const [events, setEvents] = useState<Event[]>(); // TODO THIS NEEDS TO BE SETUP!
    const [showNewEventBox, setShowNewEventBox] = useState(false);

    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [startDateTime, setStartDateTime] = useState<Date>();
    const [endDateTime, setEndDateTime] = useState<Date>();

    useClickAway(ref, (e) => {
        setCurrentlySelectedId('');
    });

    useEffect(() => {
        if (id === currentlySelectedId)
        {
            const popup = document.getElementById(`popup-calendar-${id}`)?.getBoundingClientRect();
            // const relativePos = document.getElementById(`day-calendar-${id}`)?.getClientRects()[0];
            console.log(window.innerHeight);
            if (popup)
            {
                if (popup?.x < 150)
                {
                    setoffset('left-12');
                }

                if (window.innerHeight - popup.y < 390)
                {
                    setHeightOffset('bottom-0');
                }
            }
        }
        
        supabase.from('calendar_events').select('*').then(async res => {
            setEvents(res.data as Event[]);
        });

        // TODO: Api calls for getting all events on this day.
    }, [currentlySelectedId]);

    return <div id={`popup-calendar-${id}`} ref={ref} hidden={currentlySelectedId !== id} className={`w-80 h-96 bg-tertiary overflow-y-auto scrollbar rounded flex flex-col absolute ${offset} ${heightOffset} z-40`} 
        onClick={() => setCurrentlySelectedId(id)}>
        <div className="font-semibold h-8 w-full bg-tertiary p-2 flex items-center relative">{monthText} {day}</div>
            <div className="overflow-y-auto scrollbar flex-grow bg-quaternary">
                {
                    !events &&
                    <div className="flex-grow h-full flex items-center justify-center">
                        <LoadingBox />
                    </div>
                }
                {
                    events && events.length === 0 &&
                    <div className="flex-grow h-full flex items-center justify-center">
                        <span>No Events</span>
                    </div>
                }
                {
                    showNewEventBox &&
                    <div className="w-full h-[396px] absolute z-50 top-8 bg-quaternary p-2 flex flex-col">
                        <div className="w-full h-8 flex justify-between gap-4 items-center">
                            <button className="text-primary transition p-2 rounded hover:bg-primary hover:text-secondary flex items-center" onClick={() => setShowNewEventBox(false)}>
                                <KeyboardBackspaceSharpIcon fontSize="small" />
                            </button>
                            <span className="font-semibold">Create New Event</span>
                            <button className="text-primary transition p-2 rounded hover:bg-primary hover:text-secondary flex items-center"
                            onClick={() => {
                                alert('setShowStaffInvolved Modal for selecting people attending this event!');
                            }}>
                                <PersonAddAltSharpIcon fontSize="small" />
                            </button>
                        </div>
                        <div className="flex-grow flex flex-col pt-4 gap-2 mb-2">
                            <input value={eventName} onChange={(e) => setEventName(e.target.value)} className="bg-tertiary p-2 font-semibold outline-none rounded" placeholder="Event Name" maxLength={256} />
                            <textarea value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} className="bg-tertiary p-2 font-semibold outline-none text-sm rounded scrollbar" maxLength={2048} placeholder="Event Description" />
                            <input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className="bg-tertiary p-2 font-semibold outline-none rounded text-sm" placeholder="Event Location" maxLength={256} />
                            <small>Start Time</small>
                            <input type='datetime-local' placeholder="Start Time" className="bg-tertiary px-2 rounded -mt-2" onChange={(e) => {
                                setStartDateTime(new Date(Date.parse(e.target.value)));
                            }} />
                            <small>End Time</small>
                            <input type='datetime-local' placeholder="End Time" className="bg-tertiary px-2 rounded -mt-2" onChange={(e) => {
                                setEndDateTime(new Date(Date.parse(e.target.value)));
                            }} />
                        </div>
                        <Button text='Create Event' onClick={async () => {
                                const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.provider_token}` },
                                    body: JSON.stringify({
                                        'summary': eventName,
                                        'location': eventLocation,
                                        'description': eventDescription,
                                        'start': {
                                            'dateTime': startDateTime?.toISOString() ?? new Date(Date.now()).toISOString(),
                                            'timeZone': 'Australia/Brisbane',
                                        },
                                        'end': {
                                            'dateTime': endDateTime?.toISOString() ?? new Date(Date.now()).toISOString(),
                                            'timeZone': 'Australia/Brisbane',
                                        },
                                        'attendees': [
                                            { 'email': 'nubytube@gmail.com' },
                                            { 'email': 'brodyola@gmail.com' },
                                            { 'email': 'josephkrebs00@gmail.com' }
                                        ],
                                        'reminders': {
                                            'useDefault': false,
                                            'overrides': [
                                                {'method': 'email', 'minutes': 24 * 60},
                                                {'method': 'popup', 'minutes': 10},
                                            ],
                                        },
                                    })
                                });
                                console.log(res);
                                setShowNewEventBox(false);
                            }} className="" />
                    </div>
                }
            </div>
        {
            !showNewEventBox &&
            <Button text='Add Event' onClick={() => {
                setShowNewEventBox(true);
            }} className="bg-transparent" />
        }
    </div>
}