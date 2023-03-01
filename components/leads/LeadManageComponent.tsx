import { Lead, LeadStage } from "@/models/Lead";
import Link from "next/link";
import Image from 'next/image';
import React from "react";

interface LeadManageComponentProps
{
    lead: Lead;
}


export default function LeadManageComponent({ lead }: LeadManageComponentProps)
{


    return <div className="h-14 bg-tertiary border-b-primary border-b-[1px] flex items-center gap-6 px-8 transition duration-300 hover:text-secondary hover:border-b-zinc-100 hover:bg-primary font-medium hover:cursor-pointer">
        <Link href={`/leads/${lead.id}`} className="flex flex-row gap-6 w-full items-center h-full">
            <Image src={lead.previewImageURL} alt={lead.name} width='40' height='40' className="object-cover" />
            <p>{lead.name}</p>
            <p>{lead.created_at}</p>
            <p>{lead.description}</p>
            <p>{lead.associations.join(' ')}</p>
            <p className="ml-auto font-semibold">{lead.stage?.valueOf() ?? LeadStage.UNKNOWN}</p>
        </Link>
    </div>
}