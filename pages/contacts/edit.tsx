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
import { toast } from "react-toastify";

interface NewLeadPageProps
{
    user: User;
    contact: Contact | null;
}

export default function NewContactPage({ user, contact }: NewLeadPageProps)
{
    const [deleteHover, setDeleteHover] = useState(false);
    const supabase = createBrowserSupabaseClient({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    });

    const router = useRouter();
    const [image, setImage] = useState<File>();
    const [name, setName] = useState(contact ? contact.name : '');
    const [shortDescription, setShortDescription] = useState(contact ? contact.description : '');
    const [email, setEmail] = useState(contact ? contact.email : '');
    const [phoneNumber, setPhoneNumber] = useState(contact ? contact.phoneNumber : '');
    const [linkedInURL, setLinkedInURL] = useState(contact ? contact.linkedInURL : '');
    const [location, setLocation] = useState(contact ? contact.location : '');
    const [associations, setAssociations] = useState(contact ? contact.organisations.join(',') : '');
    const [imagePreview, setImagePreview] = useState(contact ? contact.useablePreviewImageURL : '');
    const imageButtonRef = useRef<HTMLInputElement>(null);

    return <div className="w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto">
        <div className="w-full flex flex-row justify-between">
            <Link href={`/contacts/${contact?.id}`}>
                <button className="px-2 py-1 rounded-lg text-primary font-semibold transition hover:text-secondary hover:bg-primary">
                    Back to Contacts
                </button>
            </Link>
            <div className="flex items-center gap-4">
                {
                    !deleteHover &&
                    <button className="px-2 py-1 rounded-lg text-red-500 font-semibold transition hover:text-zinc-100 hover:bg-red-500"
                    onMouseOver={() => {setDeleteHover(true)}}>
                        Delete Contact
                    </button>
                }
                {
                    deleteHover &&
                    <button className="px-2 py-1 rounded-lg text-red-500 font-semibold transition hover:text-zinc-100 hover:bg-red-500"
                    onMouseLeave={() => {setDeleteHover(false)}}
                    onClick={async () => {
                        await supabase.from('contacts').delete().eq('id', contact?.id);
                        router.push('/contacts');
                    }}>
                        Warning, this is permanent!
                    </button>
                }
            </div>
        </div>
        {
            !imagePreview && !name && !shortDescription &&
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
            (imagePreview || name || shortDescription) && 
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
                    {
                        imagePreview && name && shortDescription && (image && image.name !== contact?.previewImageURL || (!image)) &&
                        <button className="px-4 py-1 rounded-lg bg-secondary text-primary transition hover:bg-primary hover:text-secondary font-bold ml-auto"
                        onClick={async () => {
                            const newId = v4();
                            let imageURL = '';
                            if (image && image.name !== contact?.previewImageURL)
                            {
                                const imageResponse = (await supabase.storage.from('contacts.pictures').upload(image.name, image, 
                                {
                                    cacheControl: '3600',
                                    upsert: true
                                }));

                                if (imageResponse.error)
                                {
                                    console.log(imageResponse.error);
                                }
                                else
                                {
                                    // TODO: Switch this over to a Supabase trigger.
                                    await supabase.storage.from('contacts.pictures').remove([contact?.previewImageURL as string]);
                                    imageURL = imageResponse.data.path;
                                }
                            }
                            setImage(undefined);
                            const response = await supabase.from('contacts').update([
                                {
                                    name: name,
                                    description: shortDescription,
                                    email: email,
                                    linkedInURL: linkedInURL,
                                    organisations: associations.split(','),
                                    phoneNumber: phoneNumber,
                                    previewImageURL: imageURL ? imageURL : contact?.previewImageURL,
                                    location: location
                                }
                            ]).eq('id', contact?.id);

                            if (response.status === 201 || response.status === 204)
                            {
                                toast.success('Contact Updated Successfully.', 
                                {
                                    position: "bottom-right",
                                    autoClose: 5000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: "colored",
                                    style: { backgroundColor: '#00fe49', color: '#090909', fontFamily: 'Rajdhani', fontWeight: '800' }
                                });
                            }
                            else
                            {
                                console.log(response);
                            }
                        }}>
                            Update Contact
                        </button>
                    }
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
            redirect: {
                destination: '/sign-in',
                permanent: false
            }
        }
    }

    let contactData: Contact | null = null;
    if (!context.query['id'])
    {
        return {
            redirect: {
                destination: '/contacts',
                permanent: false
            }
        }
    }
    if (context.query['id'])
    {
        contactData = await (await supabase.from('contacts').select('*').eq('id', context.query['id'] as string).single()).data as Contact;
        contactData.useablePreviewImageURL = (await supabase.storage.from('contacts.pictures').getPublicUrl(contactData.previewImageURL)).data?.publicUrl as string;
    }

    return {
        props: {
            user: session?.user,
            contact: contactData
        }
    }
}