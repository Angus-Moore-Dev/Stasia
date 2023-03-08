import Button from "@/components/common/Button";
import { Contact } from "@/models/Contact";
import { Profile } from "@/models/me/Profile";
import { Project } from "@/models/projects/Project";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

interface ProjectIdPageProps
{
    user: User;
    project: Project;
    profiles: Profile[];
}

export default function ProjectIdPage({ user, project, profiles }: ProjectIdPageProps)
{
    const router = useRouter();
    return <div className='w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto'>
        <div className="w-full flex flex-row items-center">
            <Button text='Back to Projects' onClick={() => {
                router.push('/projects');
            }} className="mr-auto" />
        </div>
        <div className="flex-grow flex flex-col">
            {
                JSON.stringify(project)
            }
            <br />
            <br />
            <p>{JSON.stringify(profiles)}</p>
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

    const project = (await supabaseClient.from('projects').select('*').eq('id', context.query['projectId']).single()).data as Project;
    const profiles = (await supabaseClient.from('profiles').select('id, name, profilePictureURL').in('id', project.peopleInvolved)).data as Profile[];

    for (const profile of profiles)
    {
        profile.profilePictureURL = supabaseClient.storage.from('profile.pictures').getPublicUrl(profile.profilePictureURL).data.publicUrl;
    }

	return {
		props: {
			user: session?.user ?? null,
            profiles: profiles,
            project
		}
	}
}