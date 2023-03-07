import { useUser } from "@supabase/auth-helpers-react";
import Image from "next/image";
import Link from "next/link";
import logo from '../public/logo.png';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/models/me/Profile";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";


export default function AppNavbar()
{
    const user = useUser();
    const [profile, setProfile] = useState<Profile>();


    useEffect(() => 
    {
        if (user)
        {
            supabase.from('profiles').select('*').eq('id', user?.id).single().then(async data => {
                const profileData = data.data as Profile;
                const url = supabase.storage.from('profile.pictures').getPublicUrl(profileData.profilePictureURL).data.publicUrl ?? '';
                profileData.profilePictureURL = url;
                setProfile(profileData);
            });
        }
    }, [user]);
    return (
        <div className="w-full min-h-[30] p-0 md:px-32 bg-tertiary flex flex-row items-center justify-center md:justify-start py-1">
            <Link href='/'>
                <Image src={logo} placeholder="blur" width='200' height='250' alt='logo' className="object-cover" />
            </Link>
            {
                user && profile &&
                <section className="flex-grow flex justify-end items-center gap-4">
                    {
                        profile.name
                    }
                    <Link href='/me'>
                        <Image src={profile.profilePictureURL} alt='profile' className="rounded transition hover:border-[1px] hover:border-primary" width='50' height='50' />
                    </Link>
                </section>
            }
        </div>
    )
}