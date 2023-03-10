import { Link } from "@mui/material";

export default function AppFooter()
{
    return <div className="w-full h-fit bg-tertiary text-zinc-100 flex flex-row flex-wrap px-[4%]">
        <section className="w-full md:w-1/4 min-w-fit h-full px-4 flex items-center justify-start text-center md:text-left">
            <small>Jensen Labs, Copyright 2023. All Rights Reserved.</small>
        </section>
    </div>
}