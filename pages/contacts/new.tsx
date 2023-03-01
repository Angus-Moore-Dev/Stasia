import { LeadStage } from "@/models/Lead";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRef, useState } from "react";

interface NewLeadPageProps
{
    user: User;
}

export default function NewContactPage({ user }: NewLeadPageProps)
{
    const [image, setImage] = useState<File>();
    const [name, setName] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [associations, setAssociations] = useState<string[]>([]);
    const [currentStage, setcurrentStage] = useState<LeadStage>();

    const [imagePreview, setImagePreview] = useState('');
    const imageButtonRef = useRef<HTMLInputElement>(null);

    return <div className="w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto">
        <span className="w-full">New Contact</span>
        {
            !image && !name && !shortDescription && associations.length === 0 && !currentStage &&
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
                    Lead Image
                </div>
            </div>
        }
        {
            (image || name || shortDescription || associations.length > 0 || currentStage) && 
            <section className="flex-grow flex flex-col w-full items-center justify-center">
                <div className="flex-grow flex flex-row gap-6 justify-center items-start pt-24">
                    <section className="">
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
                                Lead Image
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
                            <input value={name} onChange={(e) => setName(e.target.value)} className="p-2 bg-transparent text-zinc-100 font-semibold text-2xl outline-none border-b-2 border-b-primary w-96 h-10" placeholder="Lead Name" />
                            <div className="flex flex-col">
                                <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} 
                                className="p-2 bg-transparent text-zinc-100 outline-none font-medium border-b-2 border-b-primary w-96 h-[250px] max-h-[250px] min-h-[250px] scrollbar" placeholder="short description" />
                            </div>
                        </div>
                    </section>
                </div>
                <div className="w-full flex flex-col gap-2">
                    
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