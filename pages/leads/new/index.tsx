import ContactBox, { NewLeadBox } from "@/components/contacts/ContactBox";
import { Contact } from "@/models/Contact";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";

interface NewLeadPageProps
{
    user: User;
    contacts: Contact[];
}



export default function NewLeadPage({ user, contacts }: NewLeadPageProps)
{
    return <div className="w-full h-full flex flex-col items-center justify-start gap-4 max-w-[1920px] p-8 mx-auto">
        <Link href='/leads' className="mr-auto">
            <button className="px-4 py-1 rounded-lg bg-secondary text-primary transition hover:bg-primary hover:text-secondary font-bold">
                Back to Leads
            </button>
            <span className="pl-4">
                Select a New Lead
            </span>
        </Link>
        <p></p>
        <div className="flex-grow w-full flex flex-row flex-wrap gap-2">
        {
            contacts && contacts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(contact => <Link href={`/leads/new/${contact.id}`} className="h-96 w-80"><NewLeadBox contact={contact} /></Link>)
        }
        </div>
    </div>
}



export const getServerSideProps = async (context: GetServerSidePropsContext) =>
{
    const supabase = createServerSupabaseClient(context);
    const { data: { session }} = await supabase.auth.getSession();
    const { data, error } = await supabase.from('contacts').select(`*, leads ( id )`);
    const contacts: Contact[] = [];

    for (const contact of data?.filter(x => x.leads === null) ?? [])
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