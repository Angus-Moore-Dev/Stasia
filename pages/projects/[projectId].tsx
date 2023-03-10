import Button from "@/components/common/Button";
import { MajorFeatureBox, TaskBox } from "@/components/projects/FeatureBoxes";
import createToast from "@/functions/createToast";
import { supabase } from "@/lib/supabaseClient";
import { Contact } from "@/models/Contact";
import { Message } from "@/models/chat/Message";
import { Profile } from "@/models/me/Profile";
import { MajorFeature } from "@/models/projects/MajorFeature";
import { CommercialisationType, Project, ProjectType } from "@/models/projects/Project";
import { Task, TaskState } from "@/models/projects/Task";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { RealtimeChannel, User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";


interface ProjectIdPageProps
{
    user: User;
    project: Project;
    profiles: Profile[];
    contact: Contact | null;
}

export default function ProjectIdPage({ user, project, profiles, contact }: ProjectIdPageProps)
{
    const router = useRouter();
    const [majorFeatures, setMajorFeatures] = useState<MajorFeature[]>();
    const [currentTasks, setCurrentTasks] = useState<Task[]>();
    const [realtimeTicketChannel, setRealtimeTicketChannel] = useState<RealtimeChannel>();

    // These are the updaters for supabase. There's gotta be a faster way for this.
    const addNewTask = useCallback((task: Task) => {
        setCurrentTasks(tasks => [...tasks ?? [], task]);
    }, []);

    const removeTask = useCallback((id: number) => {
        setCurrentTasks(currentTasks => [...currentTasks?.filter(x => x.id !== id) ?? []]);
    }, []);

    const updateTask = useCallback((task: Task) => {
        setCurrentTasks(currentTasks => currentTasks?.map(x => {
            return x.id === task.id ? task : x;
        }));
    }, []);

    useEffect(() => {
        supabase.from('project_major_features').select('*').eq('projectId', project.id).then(res => 
        {
            setMajorFeatures(res.data as MajorFeature[]);
        });

        supabase.from('project_tickets').select('*').eq('projectId', project.id).then(res =>
        {
            setCurrentTasks(res.data as Task[]);
        })

        const channel = supabase.channel('table-db-changes')
        .on('postgres_changes', {event: '*', schema: 'public', table: 'project_tickets'}, (payload) => {
            console.log('payload::', payload);
            if (payload.eventType === 'INSERT')
            {
                console.log('realtime insert of ticket')
                const message = payload.new as Task;
                if (message.projectId === project.id)
                {
                    addNewTask(message);
                }
            }
            else if (payload.eventType === 'DELETE')
            {
                console.log('realtime delete of ticket')
                removeTask(payload.old.id);
            }
            else if (payload.eventType === 'UPDATE')
            {
                console.log('realtime update of ticket::', payload.new as Task);
                const message = payload.new as Task;
                updateTask(message);
            }
        }).subscribe((status) => {
            console.log('tasks::', status);
        });
        setRealtimeTicketChannel(channel);
    }, []);

    return <div className='w-full min-h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto'>
        <div className="w-full flex flex-row items-center">
            <Button text='Back to Projects' onClick={() => {
                router.push('/projects');
            }} className="mr-auto" />
            <Button text='Edit Project Details' onClick={() => {
                alert('edit project details');
            }} />
        </div>
        <div className="flex-grow w-full flex flex-col gap-6">
            <div className="w-full flex flex-row">
                <div className="flex-grow">
                    <span className="text-4xl font-semibold">{project.name}</span>
                    <p className="text-lg font-medium">{project.description}</p>
                </div>
                <div className="flex flex-col text-right w-80">
                    <span className="font-medium">{project.projectType}</span>
                    <span className="font-medium">{`${project.industry ? `${project.industry } -` : ''} `}{project.commercialisationType}</span>
                </div>
            </div>
            {
                contact &&
                <div className="w-full flex flex-col gap-2">
                    <span className="font-semibold">Contacts / Customers For Whom This Project Applies</span>
                    <div className="h-80 w-64 mb-10 flex text-left">
                        <Link href={`/contacts/${contact.id}`} className="group w-full h-full rounded bg-tertiary text-zinc-100 font-medium hover:cursor-pointer flex flex-col">
                            <Image 
                            priority={true}
                            src={contact.previewImageURL} 
                            alt='profile' 
                            width='600' height='400' 
                            className="object-cover rounded-t-sm w-full min-w-[256px] min-h-[320px]"  />
                            <div className="p-2 flex flex-col gap-2 bg-tertiary rounded-b transition group-hover:bg-primary group-hover:text-secondary aria-selected:bg-primary aria-selected:text-secondary">
                                <p className="text-lg font-medium">{contact.name}</p>
                                <span>{contact.organisations.join(", ")}</span>
                            </div>
                        </Link>
                    </div>
                </div>
            }
            <div className="w-full flex flex-col gap-2">
                <span className="font-semibold">People Involved In This Project</span>
                <div className="w-full flex flex-row gap-4 flex-wrap">
                {
                    profiles.map(profile => <div className="h-80 w-64 mb-10 flex text-left" key={profile.id}>
                        <div className="group w-full h-full rounded bg-tertiary text-zinc-100 font-medium hover:cursor-pointer flex flex-col">
                            <Image 
                            priority={true}
                            src={profile.profilePictureURL} 
                            alt='profile' 
                            width='600' height='400' 
                            className="object-cover rounded-t-sm w-full min-w-[256px] min-h-[320px]"  />
                            <div className="p-2 flex flex-col gap-2 bg-tertiary rounded-b transition group-hover:bg-primary group-hover:text-secondary aria-selected:bg-primary aria-selected:text-secondary">
                                <p className="text-lg font-medium">{profile.name}</p>
                                <span>{profile.role}</span>
                            </div>
                        </div>
                    </div>
                    )
                }
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div className="flex flex-row gap-4 items-center">
                    <span className="font-semibold">Major Features</span>
                    <Button text="Add New Feature" onClick={() => {
                        router.push(`/projects/feature/major/new?id=${project.id}`)
                    }} />
                </div>
                <span>Click on a major feature to view its minor features and associated tasks.</span>
                <div className="w-full flex flex-row flex-wrap gap-2 items-center pt-2">
                {
                    majorFeatures && majorFeatures.map(feature => <MajorFeatureBox feature={feature} />)
                }
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-4 items-center">
                    <span className="font-semibold">Tasks</span>
                </div>
                <div className="flex flex-col gap-[2px] overflow-y-auto scrollbar">
                    {
                        currentTasks && currentTasks.length === 0 &&
                        <div className="flex items-center justify-start h-14 w-full px-16">
                            No Active Tasks
                        </div>
                    }
                    {
                        currentTasks && currentTasks.sort((a, b) => a.id - b.id).map(task => <TaskBox key={task.id} task={task} profile={profiles.find(x => x.id === task.assigneeId)} />)
                    }
                </div>
                <Button text="Add New Task" onClick={async () => 
                {
                    if (currentTasks)
                    {
                        const task = new Task(project.id);
                        task.creatorId = user.id;
                        const res = await supabase.from('project_tickets').insert(task);
                        createToast(res?.error ? res.error.message : 'Successfully Created New Task', res.error !== null);
                    }
                }} className="w-fit" />
                <div className="flex flex-col gap-2 overflow-y-auto scrollbar max-h-[40vh] mt-4 mb-10">
                    <span className="font-semibold">{project.name} Discussion</span>
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

    const project = (await supabaseClient.from('projects').select('*').eq('id', context.query['projectId']).single()).data as Project;
    const profiles = (await supabaseClient.from('profiles').select('id, name, profilePictureURL, role').in('id', project.peopleInvolved)).data as Profile[];

    for (const profile of profiles)
    {
        profile.profilePictureURL = supabaseClient.storage.from('profile.pictures').getPublicUrl(profile.profilePictureURL).data.publicUrl;
    }

    console.log((await supabaseClient.from('contacts').select('id, name, organisations, previewImageURL').eq('id', project.contractedContactId).single()));
    const contact = project.contractedContactId ? (await supabaseClient.from('contacts').select('*').eq('id', project.contractedContactId).single()).data as Contact : null;
    if (contact)
        contact.previewImageURL = supabase.storage.from('contacts.pictures').getPublicUrl(contact.previewImageURL).data.publicUrl ?? '';

	return {
		props: {
			user: session?.user ?? null,
            profiles: profiles,
            project,
            contact
		}
	}
}