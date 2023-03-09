import Button from "@/components/common/Button";
import { Project } from "@/models/projects/Project";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";


interface MajorFeatureProps
{
    user: User;
    projectName: string;
    projectId: string;
}

export default function MajorFeature()
{
    const router = useRouter();
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    return <div className='w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto'>
        <div className="w-full flex flex-row items-center">
            <Button text='Back to Projects' onClick={() => {
                router.push('/projects');
            }} className="mr-auto" />
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
    const project = (await supabaseClient.from('projects').select('id, name').eq('id', context.query['projectId']).single()).data as Project;
	return {
		props: {
			user: session?.user ?? null,
			projectName: project.name,
            projectId: project.id,
		}
	}
}