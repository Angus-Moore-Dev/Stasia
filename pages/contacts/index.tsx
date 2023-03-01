import { Contact } from "@/models/Contact";
import { User } from "@supabase/supabase-js"

interface ContactPageProps
{
    user: User;
    contacts: Contact[];
}


export default function ContactPage({ user, contacts }: ContactPageProps)
{
    return <div className="w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto">
    </div>
}