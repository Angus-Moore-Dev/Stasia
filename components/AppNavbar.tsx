import { UserProfile } from "@auth0/nextjs-auth0/client";
import { useUser } from "@supabase/auth-helpers-react";
import Image from "next/image";
import Link from "next/link";

export default function AppNavbar()
{
	const user = useUser();
    return (
        <div className="w-full h-16 p-0 md:px-32 bg-tertiary flex flex-row items-center justify-center md:justify-start">
            <Link href='/'>
                <Image src='/logo.png' width='400' height='250' alt='logo' className="" />
            </Link>
            {
                user &&
                <section className="flex-grow flex justify-end items-center gap-4">
                {
                    user.email
                }
                    <Link href='/me'>
                        <Image src='/profile.JPG' alt='profile' className="rounded-xl hover:shadow-sm hover:shadow-primary hover:cursor-pointer" width='64' height='64' />
                    </Link>
                </section>
            }
        </div>
    )
}