import { LeadStage } from "@/models/Lead";
import { Contact } from '@/models/Contact';
import { User, createBrowserSupabaseClient, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRef, useState } from "react";
import EmailSharpIcon from '@mui/icons-material/EmailSharp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocalPhoneSharpIcon from '@mui/icons-material/LocalPhoneSharp';
import BusinessSharpIcon from '@mui/icons-material/BusinessSharp';
import PublicSharpIcon from '@mui/icons-material/PublicSharp';
import { v4 } from "uuid";
import { useRouter } from "next/router";
import Link from "next/link";

interface NewLeadPageProps
{
    user: User;
}

export default function NewContactPage({ user }: NewLeadPageProps)
{
    const supabase = createBrowserSupabaseClient({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    });
    const router = useRouter();
    const [image, setImage] = useState<File>();
    const [name, setName] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [linkedInURL, setLinkedInURL] = useState('');
    const [location, setLocation] = useState('');
    const [associations, setAssociations] = useState('');
    const [currentStage, setcurrentStage] = useState<LeadStage>();
    const [imagePreview, setImagePreview] = useState('');
    const imageButtonRef = useRef<HTMLInputElement>(null);

    return <div className="w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto">
        <Link href='/contacts' className="mr-auto">
            <button className="px-2 py-1 rounded-lg text-primary font-semibold transition hover:text-secondary hover:bg-primary">
                Back to Contacts
            </button>
        </Link>
        {
            !image && !name && !shortDescription && !currentStage &&
            <div className="flex-grow flex flex-col items-center justify-center">
                <input ref={imageButtonRef} hidden type="file" accept="image/*" onChange={(e) => 
                {
                    if (e.target.files) 
                    {
                        setImage(e.target.files[0]); 
                        setImagePreview(URL.createObjectURL(e.target.files[0]));
                    }
                    e.target.value = '';
                }} />
                <div className="w-64 h-64 rounded-lg bg-tertiary text-zinc-100 flex items-center justify-center hover:cursor-pointer hover:bg-primary hover:text-secondary font-medium transition hover:shadow-md hover:shadow-primary"
                onClick={() => imageButtonRef.current?.click()}>
                    Contact Image
                </div>
            </div>
        }
        {
            (image || name || shortDescription || currentStage) && 
            <section className="flex-grow flex flex-col w-full items-center justify-start">
                <div className="flex flex-row gap-6 justify-center items-start pt-24">
                    <section>
                        {
                            !imagePreview &&
                            <>
                            <input ref={imageButtonRef} hidden type="file" accept="image/*" onChange={(e) => 
                            {
                                if (e.target.files) 
                                {
                                    setImage(e.target.files[0]); 
                                    setImagePreview(URL.createObjectURL(e.target.files[0]));
                                }
                                e.target.value = '';
                            }} />
                            <div className="w-64 h-64 rounded-lg bg-tertiary text-zinc-100 flex items-center justify-center hover:cursor-pointer border-4 border-primary hover:bg-primary hover:text-secondary font-medium transition hover:shadow-md hover:shadow-primary"
                            onClick={() => imageButtonRef.current?.click()}>
                                Contact Image
                            </div>
                            </>
                        }
                        {
                            imagePreview &&
                            <>
                            <Image src={imagePreview} alt='Lead Image' width='500' height='500' className="w-64 h-64 min-w-[256px] min-h-[256px] rounded-md border-4 border-primary object-cover shadow-md shadow-primary" />
                            <span className="pt-1 transition hover:text-primary hover:cursor-pointer text-sm ml-40" onClick={() => {
                                URL.revokeObjectURL(imagePreview);
                                setImage(undefined);
                                setImagePreview('');
                            }}>Clear Image</span>
                            </>
                        }
                        
                    </section>
                    <section className="w-full h-64 flex flex-row">
                        <div className="flex flex-col">
                            <input value={name} onChange={(e) => setName(e.target.value)} className="p-2 bg-transparent text-zinc-100 font-semibold text-2xl outline-none border-b-2 border-b-primary w-96 h-10" placeholder="Contact Name" />
                            <div className="flex flex-col">
                                <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} 
                                className="p-2 bg-transparent text-zinc-100 outline-none font-medium border-b-2 border-b-primary w-96 h-[250px] max-h-[250px] min-h-[250px] scrollbar" placeholder="short description" />
                            </div>
                        </div>
                    </section>
                </div>
                <div className="w-2/5 pt-10 flex flex-col gap-4">
                    <div className="flex flex-row items-center gap-2">
                        <EmailSharpIcon fontSize="small" />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} className="text-zinc-100 bg-transparent p-2 outline-none w-full border-b-primary border-b-2" placeholder="Email Address (if applicable)" />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <LocalPhoneSharpIcon fontSize="small" />
                        <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="text-zinc-100 bg-transparent p-2 outline-none w-full border-b-primary border-b-2" placeholder="Phone Number (if applicable)" />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <LinkedInIcon fontSize="small" />
                        <input value={linkedInURL} onChange={(e) => setLinkedInURL(e.target.value)} className="text-zinc-100 bg-transparent p-2 outline-none w-full border-b-primary border-b-2" placeholder="LinkedIn URL (if applicable)" />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <BusinessSharpIcon fontSize="small" />
                        <input value={associations} onChange={(e) => setAssociations(e.target.value)} className="text-zinc-100 bg-transparent p-2 outline-none w-full border-b-primary border-b-2" placeholder="Associations (comma separated)" />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <PublicSharpIcon fontSize="small" />
                        <input value={location} onChange={(e) => setLocation(e.target.value)} className="text-zinc-100 bg-transparent p-2 outline-none w-full border-b-primary border-b-2" placeholder="Location (City, Country)" />
                    </div>
                    <button className="px-4 py-1 rounded-lg bg-secondary text-primary transition hover:bg-primary hover:text-secondary font-bold ml-auto"
                    onClick={async () => {
                        //todo: file upload for the user's image.
                        const newId = v4();
                        let imageURL = '';
                        if (image)
                        {
                            const imageResponse = (await supabase.storage.from('contacts.pictures').upload(image.name, image, {
                                cacheControl: '3600',
                                upsert: true
                            }));

                            if (imageResponse.error)
                            {
                                console.log(imageResponse.error);
                            }
                            else
                            {
                                imageURL = imageResponse.data.path;
                            }
                        }

                        const response = await supabase.from('contacts').upsert([
                            {
                                id: newId,
                                name: name,
                                description: shortDescription,
                                email: email,
                                linkedInURL: linkedInURL,
                                organisations: associations.split(','),
                                phoneNumber: phoneNumber,
                                previewImageURL: imageURL,
                                location: location
                            }
                        ]);

                        if (response.status === 201)
                        {
                            router.push(`/contacts/${newId}`);
                        }
                        else
                        {
                            console.log(response);
                        }
                    }}>
                        Create Contact
                    </button>
                </div>
            </section>
        }
    </div>
}



export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
    const supabase = createServerSupabaseClient(context);
    const { data: { session }} = await supabase.auth.getSession();

    if (!session)
    {
        return {
            redirect: '/401',
            permanent: false
        }
    }

    return {
        props: {
            user: session?.user
        }
    }
}