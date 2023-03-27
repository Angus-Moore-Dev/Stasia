import Button from "@/components/common/Button";
import { Project } from "@/models/projects/Project";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

interface ProjectDiscussionProps
{
    user: User;
    project: Project;
}

export default function ProjectDiscussion({ user, project }: ProjectDiscussionProps)
{
    const router = useRouter();

    return <div className="w-full h-full min-h-full flex flex-col items-center gap-4 p-8 mx-auto max-w-[1920px]">
        <Button text={`Back to ${project.name}`} onClick={() => {
            router.push(`/projects/${project.id}`);
        }} className="mr-auto" />
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


    return {
        props: {
            user: session.user,
            project
        }
    }
}