import Button from "@/components/common/Button";
import { Project } from "@/models/projects/Project";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

interface ProjectDiscussionProps
{
    user: User;
    project: Project;
}

export default function ProjectSecrets({ user, project }: ProjectDiscussionProps)
{
    const router = useRouter();
    const [view, setView] = useState('dev');
    const [devKeys, setDevKeys] = useState<{ key: string, value: string }[]>([]);
    const [prodKeys, setProdKeys] = useState<{ key: string, value: string }[]>([]);

    return <div className="w-full min-h-screen flex flex-col items-center gap-4 p-8 mx-auto max-w-[1920px]">
        <Button text={`Back to ${project.name}`} onClick={() => {
            router.push(`/projects/${project.id}`);
        }} className="mr-auto" />
        <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col gap-1">
                <span className="text-4xl font-semibold">{project.name} Secrets Manager</span>
                <p>
                    Manage projects for {project.name} here. If you make any changes, you will need to restart your 
                    Stasia CLI client for your given project to see the changes.
                </p>
            </div>
        </div>
        <div className="flex-grow w-full flex flex-col gap-4 rounded-md p-4 px-8">
            <div className="w-full flex flex-row items-center gap-2 mb-4">
                <button className="w-full text-primary bg-tertiary transition hover:text-secondary hover:bg-primary p-2 rounded-md font-semibold
                aria-checked:bg-primary aria-checked:text-secondary" onClick={() => {
                    setView('dev');
                }}
                aria-checked={view === 'dev'}>
                    Dev
                </button>
                <button className="w-full text-primary bg-tertiary transition hover:text-secondary hover:bg-primary p-2 rounded-md font-semibold
                aria-checked:bg-primary aria-checked:text-secondary" onClick={() => {
                    setView('prod');
                }}
                aria-checked={view === 'prod'}>
                    Prod
                </button>
            </div>
            {
                view === 'dev' &&
                <section className="w-full flex flex-col h-1/2">
                    <div className="w-full flex flex-row items-center gap-4 p-2 bg-tertiary rounded-t-md px-4 font-semibold">
                        <span className="">Dev Environment Keys</span>
                        <Button text="Add New Secret" onClick={() => {
                            setDevKeys([...devKeys, { key: '', value: '' }]);
                        }} />
                    </div>
                    <div className="flex-grow w-full bg-quaternary rounded-b-mb p-4 flex flex-col gap-4 overflow-y-auto">
                        {
                            devKeys.length === 0 &&
                            <span className="px-8">No Dev Environment Keys</span>
                        }
                        {
                            devKeys.map((keyValue, index) => (
                                <div key={index} className="w-full flex flex-row items-center gap-4">
                                    <input type='text' value={keyValue.key} onChange={(e) => {
                                        setDevKeys(devKeys.map((x, i) => {
                                            if (i === index)
                                            {
                                                return { ...x, key: e.target.value };
                                            }
                                            return x;
                                        }));
                                    }} className="w-full p-4 bg-tertiary outline-none" placeholder="Secret Name" />
                                    <input type='text' value={keyValue.value} onChange={(e) => {
                                        setDevKeys(devKeys.map((x, i) => {
                                            if (i === index)
                                            {
                                                return { ...x, value: e.target.value };
                                            }
                                            return x;
                                        }));
                                    }} className="w-full p-4 bg-tertiary outline-none" placeholder="Secret Value" />
                                    <Button text="Remove" onClick={() => {
                                        setDevKeys(devKeys.filter((x, i) => i !== index));
                                    }} className='hover:bg-red-600 text-red-500 bg-tertiary hover:text-white h-14' />
                                </div>
                            ))
                        }
                    </div>
                </section>
            }
            {
                view === 'prod' &&
                <section className="w-full flex flex-col h-1/2">
                    <div className="w-full flex flex-row items-center gap-4 p-2 bg-tertiary rounded-t-md px-4 font-semibold">
                        <span className="">Prod Environment Keys</span>
                        <Button text="Add New Secret" onClick={() => {
                            setProdKeys([...prodKeys, { key: '', value: '' }]);
                        }} />
                    </div>
                    <div className="flex-grow w-full bg-quaternary rounded-b-mb p-4 flex flex-col gap-4 overflow-y-auto">
                        {
                            prodKeys.length === 0 &&
                            <span className="px-8">No Prod Environment Keys</span>
                        }
                        {
                            prodKeys.map((keyValue, index) => (
                                <div key={index} className="w-full flex flex-row items-center gap-4">
                                    <input type='text' value={keyValue.key} onChange={(e) => {
                                        setProdKeys(prodKeys.map((x, i) => {
                                            if (i === index)
                                            {
                                                return { ...x, key: e.target.value };
                                            }
                                            return x;
                                        }));
                                    }} className="w-full p-4 bg-tertiary outline-none" placeholder="Secret Name" />
                                    <input type='text' value={keyValue.value} onChange={(e) => {
                                        setProdKeys(prodKeys.map((x, i) => {
                                            if (i === index)
                                            {
                                                return { ...x, value: e.target.value };
                                            }
                                            return x;
                                        }));
                                    }} className="w-full p-4 bg-tertiary outline-none" placeholder="Secret Value" />
                                    <Button text="Remove" onClick={() => {
                                        setProdKeys(prodKeys.filter((x, i) => i !== index));
                                    }} className='hover:bg-red-600 text-red-500 bg-tertiary hover:text-white h-14' />
                                </div>
                            ))
                        }
                    </div>
                </section>
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

    const project = (await supabaseClient.from('projects').select('*').eq('id', context.query['projectId']).single()).data as Project;

    return {
        props: {
            user: session.user,
            project
        }
    }
}