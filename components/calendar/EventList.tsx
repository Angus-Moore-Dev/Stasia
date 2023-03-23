interface EventListProps
{
    monthNumber: number;
    monthText: string;
    day: number;
}

export default function EventList({ monthNumber, monthText, day }: EventListProps)
{
    return <div className="w-64 h-96 bg-tertiary overflow-y-auto scrollbar p-2 rounded flex flex-col">
        <span className="font-semibold">{monthText} {day}</span>
        <span>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laudantium omnis rerum nostrum velit nam, eos enim sapiente dolor ipsum iusto culpa assumenda, provident inventore sequi magni earum obcaecati? Tenetur fugiat odio quasi deserunt nesciunt? Ullam amet, tempora dolore consequuntur fugiat omnis rerum quam neque harum? Blanditiis explicabo impedit modi soluta necessitatibus similique repellendus natus nisi officiis ipsum laboriosam iure, in animi facilis ab, nihil obcaecati corrupti quas fugit beatae minima! Vitae a illum laboriosam. Expedita porro est ad? Repudiandae eum id dignissimos eveniet illum minima temporibus, magnam voluptatibus doloribus animi laudantium placeat, rerum amet autem quibusdam repellat dolorum delectus culpa velit? Corporis architecto quo laborum atque, perspiciatis, totam tempore et recusandae maiores, ex repellat culpa. Laboriosam labore minus eum maiores, dolorum eligendi atque vel molestiae excepturi quod rem dicta magni commodi voluptatibus architecto earum, amet, totam quisquam! Ipsa quam repellat porro facere ab laudantium soluta perspiciatis voluptas vero ipsum dolore possimus, rem quos excepturi rerum esse reiciendis, minima sunt? Omnis ipsa itaque consequuntur dignissimos, quisquam similique deleniti? Suscipit, repudiandae? Voluptates consectetur, sint quod officiis corrupti deleniti obcaecati natus ipsam, exercitationem illum numquam eveniet nulla quidem ipsa distinctio necessitatibus ullam aperiam corporis, hic labore similique? Doloribus sit reiciendis tenetur harum non nisi nobis, adipisci iure id odio consectetur, perspiciatis in hic assumenda ipsum voluptates eveniet laboriosam. Odio cum delectus aut commodi deleniti, est aperiam modi aliquam hic iure, nulla laborum repudiandae quisquam in quia corrupti ratione similique ad odit. Blanditiis, ex.
        </span>
    </div>
}