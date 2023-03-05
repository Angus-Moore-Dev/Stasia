import { useUser } from "@supabase/auth-helpers-react";
import Image from "next/image";
import Link from "next/link";
import logo from '../public/logo.png';

export default function AppNavbar()
{
	const user = useUser();

    return (
        <div className="w-full min-h-[30] p-0 md:px-32 bg-tertiary flex flex-row items-center justify-center md:justify-start py-1">
            <Link href='/'>
                <Image src={logo} placeholder="blur" width='200' height='250' alt='logo' className="" />
            </Link>
            {
                user &&
                <section className="flex-grow flex justify-end items-center gap-4">
                    {
                        user.email
                    }
                    <Link href='/me'>
                        <Image src='/profile.JPG' alt='profile' className="rounded transition hover:border-[1px] hover:border-primary" width='50' height='50' />
                    </Link>
                </section>
            }
        </div>
    )
}