import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useClickAway } from "react-use";
import Button from "../common/Button";
import AddBoxSharpIcon from '@mui/icons-material/AddBoxSharp';
import { supabase } from "@/lib/supabaseClient";
import { Event } from "@/models/calendar/Event";
import LoadingBox from "../LoadingBox";
import KeyboardBackspaceSharpIcon from '@mui/icons-material/KeyboardBackspaceSharp';
import PersonAddAltSharpIcon from '@mui/icons-material/PersonAddAltSharp';
import createToast from "@/functions/createToast";
import { Profile } from "@/models/me/Profile";
import Image from "next/image";
import PersonSharpIcon from '@mui/icons-material/PersonSharp';


interface EventListProps
{
    monthNumber: number;
    monthText: string;
    day: number;
    id: string;
    currentlySelectedId: string;
    setCurrentlySelectedId: Dispatch<SetStateAction<string>>;
    events: Event[];
}

export default function EventList({ monthNumber, monthText, day, id, currentlySelectedId, setCurrentlySelectedId, events }: EventListProps)
{
    const formattedDateTime = `2023-${monthNumber + 1 < 10 ? `0${monthNumber + 1}` : monthNumber + 1}-${day < 10 ? `0${day}` : day}T00:00`;
    const ref = useRef<HTMLDivElement>(null);
    const [offset, setoffset] = useState('right-12');
    const [heightOffset, setHeightOffset] = useState('top-0');
    const [showNewEventBox, setShowNewEventBox] = useState(false);
    const [showInvitePeopleBox, setShowInvitePeopleBox] = useState(false);

    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [startDateTime, setStartDateTime] = useState<string>('');
    const [endDateTime, setEndDateTime] = useState<string>('');
    const [emailInvitees, setEmailInvitees] = useState<string[]>([]);

    const [allStaff, setAllStaff] = useState<Profile[]>();

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

            if (!allStaff)
            {
                const getAllStaff = async () =>
                {
                    const res = (await supabase.from('profiles').select('*').not('id', 'eq', (await supabase.auth?.getUser()).data.user?.id)).data;
                    const profiles = res as Profile[];
                    for (const profile of profiles ?? [])
                    {
                        profile.profilePictureURL = supabase.storage.from('profile.pictures').getPublicUrl(profile.profilePictureURL).data.publicUrl!;
                    }
                    setAllStaff(profiles);
                }
                getAllStaff();
            }
        }

        // TODO: Api calls for getting all events on this day.
    }, [currentlySelectedId]);

    return <div id={`popup-calendar-${id}`} ref={ref} hidden={currentlySelectedId !== id} className={`w-80 h-96 bg-tertiary overflow-y-auto scrollbar rounded flex flex-col absolute ${offset} ${heightOffset} z-30`} 
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
                    events && events?.length === 0 &&
                    <div className="flex-grow h-full flex items-center justify-center">
                        <span>No Events</span>
                    </div>
                }
                {
                    events && events?.length > 0 &&
                    <div className="flex-grow h-full flex flex-col gap-2 p-2">
                        {
                            events.sort((a, b) => Date.parse(a.start.dateTime) - Date.parse(b.start.dateTime)).map(event => <div className="group bg-tertiary rounded w-full min-h-[40px] px-2 py-1 font-medium transition hover:bg-primary hover:text-secondary hover:cursor-pointer flex flex-col gap-2"
                            onClick={() => {
                                alert('on click event view, plus notice on new stuff');
                            }}>
                                <div className="w-full flex justify-between items-center">
                                    <span className="font-bold">{event.summary}</span>
                                    <button className="text-primary group-hover:text-secondary">
                                        <span className="pr-1 font-bold">{event.attendees.length}</span>
                                        <PersonSharpIcon fontSize="small" />
                                    </button>
                                </div>
                                <div className="w-full flex items-center justify-start gap-1">
                                    <span>{new Date(Date.parse(event.start.dateTime)).toLocaleDateString('en-au', { hour: '2-digit', minute: '2-digit', weekday: 'short'}).split(' ').slice(1,)} -</span>
                                    <span>{new Date(Date.parse(event.end.dateTime)).toLocaleDateString('en-au', { hour: '2-digit', minute: '2-digit', weekday: 'short'}).split(' ').slice(1,)}</span>
                                </div>
                            </div>)
                        }
                    </div>
                }
                {
                    showNewEventBox &&
                    <div className="w-full h-[396px] absolute z-40 top-8 bg-quaternary p-2 flex flex-col">
                        <div className="w-full h-8 flex justify-between gap-4 items-center">
                            <button className="text-primary transition p-2 rounded hover:bg-primary hover:text-secondary flex items-center" onClick={() => setShowNewEventBox(false)}>
                                <KeyboardBackspaceSharpIcon fontSize="small" />
                            </button>
                            <span className="font-semibold">Create New Event</span>
                            <button className="text-primary transition p-2 rounded hover:bg-primary hover:text-secondary flex items-center"
                            onClick={() => setShowInvitePeopleBox(true)}>
                                {emailInvitees.length > 0 && <span className="pr-1 font-bold">{emailInvitees.length}</span>}
                                <PersonAddAltSharpIcon fontSize="small" />
                            </button>
                        </div>
                        <div className="flex-grow flex flex-col pt-4 gap-2 mb-2">
                            <input value={eventName} onChange={(e) => setEventName(e.target.value)} className="bg-tertiary p-2 font-semibold outline-none rounded" placeholder="Event Name" maxLength={256} />
                            <textarea value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} className="bg-tertiary p-2 font-semibold outline-none text-sm rounded scrollbar" maxLength={2048} placeholder="Event Description" />
                            <input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className="bg-tertiary p-2 font-semibold outline-none rounded text-sm" placeholder="Event Location" maxLength={256} />
                            <small>Start Time</small>
                            <input
                            type='time' placeholder="Start Time" className="bg-tertiary px-2 rounded -mt-2" onChange={(e) => {
                                setStartDateTime(e.target.value);
                            }} />
                            <small>End Time</small>
                            <input type='time' placeholder="End Time" className="bg-tertiary px-2 rounded -mt-2" onChange={(e) => {
                                setEndDateTime(e.target.value)
                            }} />
                        </div>
                        {
                            eventName && eventDescription && eventLocation && startDateTime && endDateTime &&
                            <Button text='Create Event' onClick={async () => {
                                const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.provider_token}` },
                                    body: JSON.stringify({
                                        'summary': eventName,
                                        'location': eventLocation,
                                        'description': eventDescription,
                                        'start': {
                                            'dateTime': new Date(Date.parse(`2023-${monthNumber + 1 < 10 ? `0${monthNumber + 1}` : monthNumber + 1}-${day < 10 ? `0${day}` : day}T${startDateTime}`)).toISOString(),
                                            'timeZone': 'Australia/Brisbane',
                                        },
                                        'end': {
                                            'dateTime': new Date(Date.parse(`2023-${monthNumber + 1 < 10 ? `0${monthNumber + 1}` : monthNumber + 1}-${day < 10 ? `0${day}` : day}T${endDateTime}`)).toISOString(),
                                            'timeZone': 'Australia/Brisbane',
                                        },
                                        'attendees': [
                                            emailInvitees.length > 0 && emailInvitees.map(x => { return { email: x } })
                                        ],
                                        'reminders': {
                                            'useDefault': false,
                                            'overrides': [
                                                {'method': 'email', 'minutes': 24 * 60},
                                                {'method': 'popup', 'minutes': 60 },
                                                {'method': 'popup', 'minutes': 10 },
                                            ],
                                        },
                                    })
                                });
                                if (res.status < 400)
                                {
                                    createToast('Successfully Created Event Invite!', false);
                                    setShowNewEventBox(false);
                                    setCurrentlySelectedId('');
                                }
                                else
                                {
                                    createToast(`Error with Status:: ${res.status}`, true);
                                }
                            }} className="-mx-2 mt-[2px] bg-tertiary" />
                        }
                    </div>
                }
                {
                    showInvitePeopleBox &&
                    <div className="w-full h-[396px] absolute z-40 top-8 bg-quaternary p-2 flex flex-col">
                        <div className="w-full h-8 flex justify-between gap-4 items-center">
                            <button className="text-primary transition p-2 rounded hover:bg-primary hover:text-secondary flex items-center" onClick={() => setShowInvitePeopleBox(false)}>
                                <KeyboardBackspaceSharpIcon fontSize="small" />
                            </button>
                            <span className="font-semibold w-full pl-14">Invite People</span>
                        </div>
                        <div className="flex-grow h-full flex flex-col gap-2 overflow-y-auto scrollbar">
                            {
                                allStaff && allStaff.map(profile => <button className="w-full bg-tertiary p-2 flex flex-row gap-2 transition
                                hover:bg-primary hover:text-secondary font-medium rounded aria-selected:bg-primary aria-selected:text-secondary" 
                                aria-selected={emailInvitees.some(x => x === profile.email)}
                                onClick={async () => {
                                    if (emailInvitees.some(x => x === profile.email))
                                        setEmailInvitees(emailInvitees.filter(x => x !== profile.email))
                                    else
                                        setEmailInvitees(emailInvitees => [...emailInvitees, profile.email])
                                }}>
                                    <Image src={profile.profilePictureURL} alt='asfasf' width='40' height='40' className='rounded object-cover w-[40px] h-[40px]' />
                                    <div className="flex flex-col items-start">
                                        <p className=''>{profile.name}</p>
                                        <small className="text-xs">{profile.location}</small>
                                    </div>
                                </button>)
                            }
                        </div>
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