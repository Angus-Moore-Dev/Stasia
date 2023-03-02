import { Contact } from "@/models/Contact";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import LoadingBox from "../LoadingBox";

interface ContactBoxProps
{
    contact: Contact;
}


export default function ContactBox({ contact }: ContactBoxProps)
{
    const [beforeLoadImage, setBeforeLoadImage] = useState<JSX.Element | undefined>(<div className="flex items-center justify-center"><LoadingBox content={<Image src='/favicon.ico' alt='logo' height={40} width={40} />} /></div>);

    return <Link href={`/contacts/${contact.id}`} className="h-96 w-80 mb-9">
        <div className="group w-full h-full rounded bg-tertiary text-zinc-100 font-medium  hover:cursor-pointer flex flex-col">
            {/* {
                beforeLoadImage && beforeLoadImage
            } */}
            <Image 
            src={contact.previewImageURL} 
            alt='profile' 
            width='600' height='400' 
            className="object-cover rounded-t-sm min-w-[320px] min-h-[384px]" 
            onLoadingComplete={() => {
                setBeforeLoadImage(undefined);
            }} />
            <div className="p-2 flex flex-col gap-2 bg-tertiary rounded-b transition group-hover:bg-primary group-hover:text-secondary">
                <p className="text-lg font-medium">{contact.name}</p>
                <span>{contact.location}</span>
            </div>
        </div>
    </Link>
}


export function NewLeadBox({ contact }: ContactBoxProps)
{
    const [beforeLoadImage, setBeforeLoadImage] = useState<JSX.Element | undefined>(<div className="flex items-center justify-center"><LoadingBox content={<Image src='/favicon.ico' alt='logo' height={40} width={40} />} /></div>);

    return <div className="group w-full h-full rounded bg-tertiary text-zinc-100 font-medium  hover:cursor-pointer flex flex-col">
        {/* {
            beforeLoadImage && beforeLoadImage
        } */}
        <Image 
        src={contact.previewImageURL} 
        alt='profile' 
        width='600' height='400' 
        className="object-cover rounded-t-sm min-w-[320px] min-h-[384px]" 
        onLoadingComplete={() => {
            setBeforeLoadImage(undefined);
        }} />
        <div className="p-2 flex flex-col gap-2 bg-tertiary rounded-b transition group-hover:bg-primary group-hover:text-secondary">
            <p className="text-lg font-medium">{contact.name}</p>
            <span>{contact.location}</span>
        </div>
    </div>
}