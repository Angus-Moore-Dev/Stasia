import Month from "@/components/calendar/Month";
import { useState } from "react";

export default function Calendar()
{
    // the id of the actively selected box.
    const [showEvents, setShowEvents] = useState('');

    return <div className="w-full h-full flex flex-col gap-4 p-8 max-w-[1920px] mx-auto">
        <span>Calendar / Events</span>
        <div className="w-full h-full flex flex-col gap-4 justify-center items-center mx-auto">
            {
                Array.from(Array(13).keys()).map(x => <Month month={x} showEvents={showEvents} setShowEvents={setShowEvents} />)
            }
        </div>
    </div>
}