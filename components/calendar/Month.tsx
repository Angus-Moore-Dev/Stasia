import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import EventList from "./EventList";
import { v4 } from "uuid";
import { useClickAway } from "react-use";
import { Event } from "@/models/calendar/Event";

interface MonthProps
{
    month: number;
    showEvents: string;
    setShowEvents: Dispatch<SetStateAction<string>>;
    events: Event[];
}

export default function Month({ month, showEvents, setShowEvents, events }: MonthProps)
{
    const [monthText, setMonthText] = useState('');
    const [daysInMonth, setDaysInMonth] = useState(0);

    useEffect(() => 
    {
        switch(month)
        {
            case 0:
                setMonthText('January');
                setDaysInMonth(32);
                break;
            case 1:
                setMonthText('February');
                setDaysInMonth(29);
                break;
            case 2:
                setMonthText('March');
                setDaysInMonth(32);
                break;
            case 3:
                setMonthText('April');
                setDaysInMonth(31);
                break;
            case 4:
                setMonthText('May');
                setDaysInMonth(32);
                break;
            case 5:
                setMonthText('June');
                setDaysInMonth(31);
                break;
            case 6:
                setMonthText('July');
                setDaysInMonth(32);
                break;
            case 7:
                setMonthText('August');
                setDaysInMonth(32);
                break;
            case 8:
                setMonthText('September');
                setDaysInMonth(31);
                break;
            case 9:
                setMonthText('October');
                setDaysInMonth(32);
                break;
            case 10:
                setMonthText('November');
                setDaysInMonth(31);
                break;
            case 11:
                setMonthText('December');
                setDaysInMonth(32);
                break;
        }
    }, [month]);


    return <div className="w-full flex flex-col justify-center px-8">
        <span className="w-full pb-1 font-semibold">
            {monthText}
        </span>
        <div className=" flex flex-row relative flex-wrap">
            {
                Array.from(Array(daysInMonth).keys()).map(x => 
                {
                    return <Day monthText={monthText} month={month} day={x} currentlySelectedId={showEvents} setCurrentlySelectedId={setShowEvents} events={events.filter(x1 => new Date(Date.parse(x1.start.dateTime)).getDate() === x)} />
                })
            }
        </div>
    </div>
}

interface DayProps
{
    currentlySelectedId: string;
    setCurrentlySelectedId: Dispatch<SetStateAction<string>>;
    monthText: string;
    month: number;
    day: number;
    events: Event[];
}

function Day({ monthText, month, day, currentlySelectedId: showBox, setCurrentlySelectedId: setShowBox, events }: DayProps)
{
    const [id] = useState(v4());

    return <div id={`day-calendar-${id}`} className="relative flex flex-col mt-4">
        {
            (new Date(Date.now()).getMonth() === month && new Date(Date.now()).getDate() === day) &&
            <span className="absolute bottom-10">Today</span>
        }
        <button 
        id={`calendar-popup-${id}`} key={day} className="w-10 h-10 rounded text-zinc-100 transition 
        hover:text-secondary hover:bg-primary font-semibold aria-selected:text-primary aria-selected:bg-tertiary 
        aria-selected:hover:text-secondary aria-selected:hover:bg-primary aria-expanded:border-primary aria-expanded:border-2
        aria-checked:bg-primary aria-checked:text-secondary"
        aria-expanded={events.length > 0}
        aria-checked={showBox === id}
        aria-selected={new Date(Date.now()).getMonth() === month && new Date(Date.now()).getDate() === day && showBox !== id}
        onClick={() => {
            if (showBox === id)
                setShowBox('');
            else
                setShowBox(id);
        }}>
            {day}
        </button>
        {
            showBox === id && <EventList monthNumber={month} monthText={monthText} day={day} setCurrentlySelectedId={setShowBox} currentlySelectedId={showBox} id={id} events={events} />
        }
    </div>
}