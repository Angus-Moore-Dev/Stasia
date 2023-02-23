import { Link } from "@mui/material";

export default function AppFooter()
{
    return <div className="w-full h-14 bg-blue-700 text-zinc-100 flex flex-row px-[4%]">
        <section className="w-1/4 h-full px-4 flex items-center justify-start">
            App Name Here
        </section>
        <section className="w-3/4 h-full px-4 flex justify-end text-zinc-100 items-center gap-6">
            <Link href='/privacy'>
                <small className="text-zinc-100">Privacy Policy</small>
            </Link>
            <Link href='/tos'>
                <small className="text-zinc-100">Terms of Service</small>
            </Link>
            <Link href='/contact'>
                <small className="text-zinc-100">Contact</small>
            </Link>
        </section>
    </div>
}