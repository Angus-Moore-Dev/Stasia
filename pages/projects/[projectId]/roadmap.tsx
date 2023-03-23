import Button from "@/components/common/Button";
import { Contact } from "@/models/Contact";
import { Profile } from "@/models/me/Profile";
import { Project } from "@/models/projects/Project";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

interface ProjectRoadmapProps
{
    user: User;
    projectName: string;
}

export default function ProjectRoadmap({ user, projectName }: ProjectRoadmapProps)
{
    const router = useRouter();
    const projectId = router.query['projectId'] as string;

    return <div className="w-full h-full max-w-[1920px] mx-auto p-8">
        <div className="w-full flex flex-row items-center">
            <Button text={`Back to ${projectName}`} onClick={() => {
                router.push(`/projects/${projectId}`);
            }} className="mr-auto" />
        </div>
        <div className="flex-grow flex flex-col gap-4 mt-4">
            <div className="flex flex-col">
                <span className="text-4xl font-semibold">{projectName} Roadmap</span>
                <span className="text-lg font-medium">Plan new features, release dates, events and anything related to this project.</span>
            </div>
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

    const projectName = (await supabaseClient.from('projects').select('name').eq('id', context.query['projectId'] as string).single()).data?.name as string;

	return {
		props: {
			user: session?.user ?? null,
            projectName
		}
	}
}