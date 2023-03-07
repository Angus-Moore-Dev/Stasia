
import Button from "@/components/common/Button";
import { CommercialisationType, ProjectType } from "@/models/projects/Project";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js"
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
interface ProectsPageProps
{
    user: User;
}

export default function NewProjectPage({ user }: ProectsPageProps)
{
    const router = useRouter();
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projectType, setProjectType] = useState<ProjectType>();
    const [commercialisationType, setCommercialisationType] = useState<CommercialisationType>();
    const [industry, setIndustry] = useState('');
    const [staffInvolved, setStaffInvolved] = useState<string[]>([]);
    const [targetContractId, setTargetContractId] = useState(''); // For contracts only.

    return <div className='w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto'>
        <div className="w-full flex items-center gap-2">
            <Button text='Back to Projects' onClick={() => {
                router.push('/projects');
            }} className="mr-auto" />
        </div>
        <div className="flex-grow flex flex-col gap-4 justify w-full">
            <span>Create New Project</span>
            <div className="w-1/2 flex flex-row items-center gap-2">
                <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="text-zinc-100 bg-transparent p-2 outline-none w-full border-b-primary border-b-2 text-lg font-semibold" placeholder="Project Name" />
            </div>
            <div className="w-1/2 flex flex-row items-center gap-2">
                <input value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} className="text-zinc-100 bg-transparent p-2 outline-none w-full border-b-primary border-b-2 text-lg" placeholder="Project Description" />
            </div>
            <div className="w-1/2 flex flex-row items-center gap-2">
                <input value={industry} onChange={(e) => setIndustry(e.target.value)} className="text-zinc-100 bg-transparent p-2 outline-none w-full border-b-primary border-b-2 text-lg" placeholder="Industry" />
            </div>
            <div className="w-full flex flex-row gap-2">
                <div className="flex flex-col gap-2">
                    <span>Project Type</span>
                    {
                        Object.values(ProjectType).map(type => <button className="w-80 p-4 rounded bg-tertiary text-primary 
                        font-semibold text-lg transition hover:bg-primary hover:text-secondary aria-selected:bg-primary aria-selected:text-secondary"
                        aria-selected={projectType === type}
                        onClick={() => setProjectType(type)}>
                            {type}
                        </button>
                        )
                    }
                </div>
                <div className="flex flex-col gap-2">
                    <span>Commercialisation Type</span>
                    {
                        Object.values(CommercialisationType).map(type => <button className="w-80 p-4 rounded bg-tertiary text-primary 
                        font-semibold text-lg transition hover:bg-primary hover:text-secondary aria-selected:bg-primary aria-selected:text-secondary"
                        aria-selected={commercialisationType === type}
                        onClick={() => setCommercialisationType(type)}>
                            {type}
                        </button>
                        )
                    }
                </div>
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

	return {
		props: {
			user: session?.user ?? null,
		}
	}
}