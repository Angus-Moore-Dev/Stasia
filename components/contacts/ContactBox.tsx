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
    const [beforeLoadImage, setBeforeLoadImage] = useState<JSX.Element | undefined>(<div className="flex-grow flex items-center justify-center relative"><LoadingBox content={<Image src='/favicon.ico' alt='logo' height={40} width={40} />} /></div>);

    return <Link href={`/contacts/${contact.id}`} className="h-96 w-80">
        <div className="w-full h-full rounded bg-tertiary text-zinc-100 font-medium transition hover:bg-primary hover:text-secondary hover:cursor-pointer flex flex-col">
            <Image 
            src={contact.previewImageURL} 
            alt='profile' 
            width='600' height='400' 
            className="object-cover rounded-t-sm" 
            onLoadingComplete={() => {
                setBeforeLoadImage(undefined);
            }} />
            {
                beforeLoadImage && beforeLoadImage
            }
            <p className="p-2 text-lg font-medium h-16">{contact.name}</p>
        </div>
    </Link>
}