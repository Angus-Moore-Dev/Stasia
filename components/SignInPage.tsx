import Image from "next/image";
import Button from "./common/Button";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingBox from "./LoadingBox";
import { Router, useRouter } from "next/router";
import logo from '../public/logo.png';
import GoogleIcon from '@mui/icons-material/Google';

export default function SignInPage()
{
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(async res => {
            if (res.data.session)
            {
                router.push('/');
            }
        })
    }, []);

    return <div className="h-full w-full max-w-6xl flex flex-col items-center justify-center mx-auto">
        <div className="flex flex-col gap-4 p-4 rounded bg-tertiary justify-start">
            <div>
                <Image placeholder="blur" src={logo} alt='logo' height='600' width='500' className="mb-10" />
            </div>
            <span>Sign in to Stasia</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="pb-2 bg-transparent text-zinc-100 font-semibold outline-none border-b-2 border-b-primary h-10 mb-4 w-full" placeholder="Username" type="email" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="pb-2 bg-transparent text-zinc-100 font-semibold outline-none border-b-2 border-b-primary h-10 mb-4 w-full" placeholder="Password" type='password' />
            {
                isSigningIn &&
                <div className="mx-auto">
                    <LoadingBox content={<Image src='/favicon.ico' alt='logo' width='25' height='25' />} />
                </div>
            }
            {
                !isSigningIn &&
                <Button text="Login to Stasia" onClick={async () => {
                    setIsSigningIn(true);
                    const { error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error)
                    {
                        toast.error(error.message);
                    }
                    setIsSigningIn(false);
                }} />
            }
            {/* {
                !isSigningIn &&
                <>
                <button className="w-full p-2 bg-secondary text-primary font-bold rounded flex flex-row gap-4 items-center justify-center transition hover:bg-primary hover:text-secondary"
                onClick={async () => {
                    const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            scopes: 'https://www.googleapis.com/auth/calendar',
                            queryParams: {
                                access_type: 'offline',
                                prompt: 'consent',
                            },
                            redirectTo: window.location.origin
                        }
                    });
                    if (error)
                    {
                        console.log(error);
                    }
                }}>
                    <GoogleIcon fontSize="medium" />
                    <span>Sign In With Google</span>
                </button>
                </>
            } */}
        </div>
    </div>
}