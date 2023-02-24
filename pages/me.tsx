import { useUser } from "@supabase/auth-helpers-react";

export default function MePage()
{
	const user = useUser();

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            asdasd
        </div>
    )
}