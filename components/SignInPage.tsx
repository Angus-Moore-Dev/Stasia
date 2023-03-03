import Image from "next/image";
import Button from "./common/Button";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { toast } from "react-toastify";
import LoadingBox from "./LoadingBox";
import { Router, useRouter } from "next/router";
import logo from '../public/logo.png';

export default function SignInPage()
{
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);

    return <div className="h-full w-full max-w-6xl flex flex-col items-center justify-center mx-auto">
        <form className="flex flex-col gap-4 p-4 rounded-lg bg-tertiary  justify-start">
            <div>
                <Image placeholder="blur" src={logo} alt='logo' height='600' width='500' className="mb-24" />
            </div>
            <span>Sign in to Psychostasia</span>
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
                <Button text='Sign In' onClick={async () => {
                    setIsSigningIn(true);
                    const res = await supabase.auth.signInWithPassword({
                        email: email,
                        password: password
                    });
    
                    if (res.data.session)
                    {
                        toast.success('Sign in Success.',
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
                        router.push('/');
                        setIsSigningIn(false);
                    }
                    else
                    {
                        toast.error(res.error?.message, 
                        {
                            position: "bottom-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                            style: { backgroundColor: '#090909', color: '#ef4444', fontFamily: 'Rajdhani', fontWeight: '800' }
                        });
                        setIsSigningIn(false);
                    }
                }} />
            }
        </form>
    </div>
}