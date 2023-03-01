import { Contact } from "@/models/Contact";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { useState } from "react";
import Image from 'next/image';
import EmailSharpIcon from '@mui/icons-material/EmailSharp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocalPhoneSharpIcon from '@mui/icons-material/LocalPhoneSharp';
import BusinessSharpIcon from '@mui/icons-material/BusinessSharp';
import Link from "next/link";

interface SpecificContactPageProps
{
    user: User;
    contact: Contact;
}


export default function SpecificContactPage({ user, contact }: SpecificContactPageProps)
{
    const [imagePreview, setImagePreview] = useState('');
    const [name, setName] = useState(contact.name);
    const [shortDescription, setShortDescription] = useState(contact.description);

    return <div className="w-full h-full flex flex-col items-center justify-start gap-4 max-w-[1920px] p-8 mx-auto">
        <div className="w-full flex flex-row gap-4 justify-center items-center">
            <Image src={contact.previewImageURL} alt='Lead Image' width='500' height='500' className="w-64 h-64 min-w-[256px] min-h-[256px] rounded-md border-4 border-primary object-cover shadow-md shadow-primary" />
            <section className="w-full h-64 flex flex-row">
                <div className="w-full flex flex-col">
                    <input value={name} onChange={(e) => setName(e.target.value)} className="p-2 bg-transparent text-zinc-100 font-semibold text-4xl outline-none border-b-2 border-b-primary w-96 h-10" placeholder="Lead Name" />
                    <div className="w-full flex flex-col">
                        <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} 
                        className="px-2 pb-2 pt-4 bg-transparent text-zinc-100 outline-none font-medium w-2/3 h-[250px] max-h-[250px] min-h-[250px] scrollbar" placeholder="short description" />
                    </div>
                </div>
            </section>
        </div>
        <div className="mx-auto flex flex-col gap-2 w-full">
            {
                contact.organisations &&
                <div className="flex flex-row gap-2 items-center">
                    <span className="text-primary"><BusinessSharpIcon fontSize="small" /></span>
                    <div className="flex flex-row flex-wrap gap-2 w-64">
                    {
                        contact.organisations.map(organisation => <span className="font-medium">{organisation}</span>)
                    }
                    </div>
                </div>
            }
            {
                contact.email &&
                <div className="flex flex-row gap-2 items-center">
                    <span className="text-primary"><EmailSharpIcon fontSize="small" /></span>
                    <span className="font-medium">{contact.email}</span>
                </div>
            }
            {
                contact.phoneNumber &&
                <div className="flex flex-row gap-2 items-center">
                    <span className="text-primary"><LocalPhoneSharpIcon fontSize="small" /></span>
                    <span className="font-medium">{contact.phoneNumber}</span>
                </div>
            }
            {
                contact.linkedInURL &&
                <div className="flex flex-row gap-2 items-center">
                    <span className="text-primary"><LinkedInIcon fontSize="small" /></span>
                    <Link href={contact.linkedInURL} target="_blank" className="font-medium transition hover:text-primary">{contact.linkedInURL}</Link>
                </div>
            }
            {
                contact.location &&
                <span className="font-medium text-neutral-300">{contact.location}</span>
            }
        </div>
    </div>
}


export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
    const supabase = createServerSupabaseClient(context);
    const { data: { session }} = await supabase.auth.getSession();
    const { data, error } = await supabase.from('contacts').select("*").eq('id', context.query['contactId'] as string).single();

    return {
        props: {
            user: session?.user,
            contact: data as Contact,
        }
    }
}