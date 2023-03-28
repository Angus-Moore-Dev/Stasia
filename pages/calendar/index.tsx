import LoadingBox from "@/components/LoadingBox";
import Month from "@/components/calendar/Month";
import { supabase } from "@/lib/supabaseClient";
import { Event } from "@/models/calendar/Event";
import { Session, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface CalendarProps
{
    session: Session;
}

export default function Calendar({ session }: CalendarProps)
{
    const router = useRouter();
    const { code } = router.query;

    // the id of the actively selected box.
    const [showEvents, setShowEvents] = useState('');
    const [googleAuthCode] = useState(code ? code : '');
    const [allEvents, setAllEvents] = useState<Event[]>();

    useEffect(() => {
        fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=2023-01-01T00:00:00-10:00', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.provider_token}`
            }
        }).then(async res => {
            if (res.status === 401)
            {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        scopes: 'https://www.googleapis.com/auth/calendar',
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'consent',
                        },
                        redirectTo: `${window.location.origin}/calendar`
                    }
                });
                if (error)
                {
                    console.log(error);
                }
            }
            else
            {
                const response = await res.json();
                console.log(response);
                setAllEvents(response.items);
            }
        });

        const update = setInterval(async () => {
            
            const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=2023-01-01T00:00:00-10:30', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`
                }
            })
            console.log('updating calendar::', res.status);
            if (res.status === 401)
            {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        scopes: 'https://www.googleapis.com/auth/calendar',
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'consent',
                        },
                        redirectTo: `${window.location.origin}/calendar`
                    }
                });
                if (error)
                {
                    console.log(error);
                }
            }
            else
            {
                const response = await res.json();
                console.log(response);
                setAllEvents(response.items);
            }

            
        }, 30 * 1000);
        return () => clearInterval(update)
    }, []);

    return <div className="w-full h-full flex flex-col gap-4 p-8 max-w-[1920px] mx-auto">
        <span>Calendar / Events</span>
        <div className="w-full h-full flex flex-col gap-4 justify-center items-center mx-auto">
            {
                !allEvents &&
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <LoadingBox content={<Image src='/favicon.ico' alt='logo' width='25' height='25' />} />
                    <span>Loading Calendar</span>
                </div>
            }
            {
                allEvents &&
                Array.from(Array(13).keys()).map(x => <Month 
                    month={x} 
                    showEvents={showEvents} 
                    setShowEvents={setShowEvents} 
                    events={allEvents.filter(x1 => new Date(Date.parse(x1.start.dateTime)).getMonth() === x)} 
                    setAllEvents={setAllEvents}
                />)
            }
        </div>
    </div>
}


export const getServerSideProps = async (context: GetServerSidePropsContext) =>
{
	const supabaseClient = createServerSupabaseClient(context);
	const { data: { session }} = await supabaseClient.auth.getSession();
	if (!session)
	{
		return {
			redirect: {
				destination: '/sign-in',
				permanent: false
			}
		}
	}

	return {
		props: {
			session: session
		}
	}
}