import ContactBox from "@/components/contacts/ContactBox";
import { Contact } from "@/models/Contact";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js"
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useState } from "react";

interface ContactPageProps
{
    user: User;
    contacts: Contact[];
}


export default function ContactPage({ user, contacts }: ContactPageProps)
{
    const [searchForProfile, setSearchForProfile] = useState('');

    return <div className="w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto">
        <div className="w-full flex flex-row items-center">
            <span>Contacts</span>
            <Link href='/contacts/new' className="ml-auto">
                <button className="px-4 py-1 rounded-lg bg-secondary text-primary transition hover:bg-primary hover:text-secondary font-bold">
                    New Contact
                </button>
            </Link>
        </div>
        <div className="flex-grow w-full flex flex-col gap-4">
            <input value={searchForProfile} onChange={(e) => setSearchForProfile(e.target.value)} className="p-2 bg-tertiary text-zinc-100 font-medium border-b-[1px] border-b-primary outline-none w-1/2 rounded"
            placeholder="Search Contact List" />
            <div className="flex-grow flex flex-row flex-wrap gap-2">
            {
                contacts && contacts.filter(x => x.name.toLowerCase().startsWith(searchForProfile.toLowerCase())).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(contact => <ContactBox key={contact.id} contact={contact} />)
            }
            </div>
        </div>
    </div>
}



export const getServerSideProps = async (context: GetServerSidePropsContext) =>
{
    const supabase = createServerSupabaseClient(context);
    const { data: { session }} = await supabase.auth.getSession();
    const { data, error } = await supabase.from('contacts').select('*');
    const contacts: Contact[] = [];

    for (const contact of data ?? [])
    {
        contact.previewImageURL = (await supabase.storage.from('contacts.pictures').createSignedUrl(contact.previewImageURL, 60)).data?.signedUrl ?? '';
        contacts.push(contact as Contact);
    }

    if (!session)
    {
        return {
            redirect: {
                destination: '/401',
                permanent: false
            }
        }
    }

    return {
        props: {
            user: session?.user ?? null,
            contacts: contacts
        }
    }
}