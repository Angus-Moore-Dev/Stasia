import Button from "@/components/common/Button";
import { Project } from "@/models/projects/Project";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js"
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

interface ProectsPageProps
{
    user: User;
	projects: Project[];
}

export default function ProjectsPage({ user, projects }: ProectsPageProps)
{
    const router = useRouter();
    return <div className='w-full h-full flex flex-col items-center justify-start gap-4 max-w-[1920px] p-8 mx-auto'>
        <div className="w-full flex items-center gap-2">
			<p className="mr-auto">Projects</p>
            <Button text='New Project' onClick={() => 
            {
                router.push('/projects/new');
            }} />
        </div>
        <div className="flex flex-row flex-wrap gap-4 w-full justify-start">
			{
				projects.map(project => <ProjectBox project={project} />)
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
	const { data, error } = await supabaseClient.from('projects').select('*');
	return {
		props: {
			user: session?.user ?? null,
			projects: data as Project[]
		}
	}
}

interface ProjectBoxProps
{
	project: Project;
}

function ProjectBox({ project }: ProjectBoxProps)
{
	return <Link href={`/projects/${project.id}`} className="w-80 h-64 rounded bg-tertiary p-4 flex flex-col gap-2 transition hover:bg-primary hover:text-secondary hover:cursor-pointer">
		<p className="text-xl font-semibold">{project.name}</p>
		<p className="pt-2 flex-grow overflow-y-auto scrollbar">
			{project.description}
		</p>
		<div className="w-full flex flex-row justify-between">
			<small className="font-medium">{project.projectType.valueOf()} - {project.commercialisationType.valueOf()}</small>
			<small className="font-medium">{project.industry ? project.industry : 'No Industry'}</small>
		</div>
	</Link>
}