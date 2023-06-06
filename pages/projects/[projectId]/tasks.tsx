import LoadingBox from "@/components/LoadingBox";
import Button from "@/components/common/Button";
import CategoryBox from "@/components/projects/CategoryBox";
import { TaskBox } from "@/components/projects/FeatureBoxes";
import NewTaskCategoryModal from "@/components/projects/NewTaskCategoryModal";
import SprintSection from "@/components/projects/SprintSection";
import createNewNotification from "@/functions/createNewNotification";
import createToast from "@/functions/createToast";
import { supabase } from "@/lib/supabaseClient";
import { Contact } from "@/models/Contact";
import { Profile } from "@/models/me/Profile";
import { MajorFeature } from "@/models/projects/MajorFeature";
import { Project } from "@/models/projects/Project";
import { Task, TaskState } from "@/models/projects/Task";
import { TaskCategory } from "@/models/projects/TaskCategory";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { RealtimeChannel } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

interface ProjectIdPageProps
{
    user: User;
    profile: Profile;
    project: Project;
    profiles: Profile[];
    contact: Contact | null;
    categories: TaskCategory[];
}

export default function ProjectTasks({ user, project, profile, profiles, contact, categories }: ProjectIdPageProps)
{
    const router = useRouter();
    const [majorFeatures, setMajorFeatures] = useState<MajorFeature[]>();
    const [currentTasks, setCurrentTasks] = useState<Task[]>();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showNewTaskCategory, setShowNewTaskCategory] = useState(false);
    const [categoriesForProject, setCategoriesForProject] = useState<TaskCategory[]>(categories);

    // These are the updaters for supabase. There's gotta be a faster way for this.
    const addNewTask = useCallback((task: Task) => {
        setCurrentTasks(tasks => [...tasks ?? [], task]);
    }, []);

    const removeTask = useCallback((id: number) => {
        setCurrentTasks(currentTasks => [...currentTasks?.filter(x => x.id !== id) ?? []]);
    }, []);

    useEffect(() => {
        supabase.from('project_major_features').select('*').eq('projectId', project.id).then(res => 
        {
            setMajorFeatures(res.data as MajorFeature[]);
        });

        supabase.from('project_tickets').select('*').eq('projectId', project.id).neq('taskState', TaskState.Archived).then(res =>
        {
            setCurrentTasks(res.data as Task[]);
        })

        supabase.channel('category_updates')
        .on('postgres_changes', {event: '*', schema: 'public', table: 'task_categories'}, (payload) => {
            if (payload.eventType === 'INSERT')
            {
                const message = payload.new as TaskCategory;
                if (message.projectId === project.id)
                {
                    setCategoriesForProject(categories => [...categories, message]);
                }
            }
            else if (payload.eventType === 'DELETE')
            {
                const message = payload.old as TaskCategory;
                setCategoriesForProject(categories => [...categories.filter(x => x.id !== message.id)]);
            }
            else if (payload.eventType === 'UPDATE')
            {
                const message = payload.new as TaskCategory;
                setCategoriesForProject(categories => {
                    const allCategories = [...categories];
                    allCategories[allCategories.findIndex(x => x.id === message.id)] = message;
                    return allCategories;
                });
            }
        }).subscribe((status) => console.log('categories::', status));

        supabase.channel('table-db-changes')
        .on('postgres_changes', {event: '*', schema: 'public', table: 'project_tickets'}, (payload) => {
            if (payload.eventType === 'INSERT')
            {
                const message = payload.new as Task;
                if (message.projectId === project.id)
                {
                    addNewTask(message);
                }
            }
            else if (payload.eventType === 'DELETE')
            {
                removeTask(payload.old.id);
            }
            else if (payload.eventType === 'UPDATE')
            {
                const message = payload.new as Task;
                setCurrentTasks(currentTasks => {
                    const allTasks = [...currentTasks ?? []];
                    allTasks[allTasks.findIndex(x => x.id === message.id)] = message;
                    return allTasks;
                });
            }
        }).subscribe((status) => {
            console.log('tasks::', status);
        });
    }, []);

    return <div className="w-full h-full max-w-[1920px] mx-auto flex flex-col gap-4 p-8 justify-start min-h-full">
        {
            (!currentTasks || !majorFeatures) &&
            <div className="flex-grow flex items-center justify-center">
                <LoadingBox />
            </div>
        }
        {
            currentTasks && majorFeatures &&
            <>
            <Button text={`Back to ${project.name}`} onClick={() => {
                router.push(`/projects/${project.id}`);
            }} className="mr-auto" />
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1 mb-4">
                    <span className="text-4xl font-semibold">{project.name} Tasks</span>
                </div>
                <div className="w-full flex flex-row items-start gap-2">
                    <div className="flex-grow flex flex-row flex-wrap gap-2">
                    {
                        <CategoryBox currentCategoryId={selectedCategory} category={{ name: 'General Tasks', id: '', description: 'General Tasks', projectId: project.id }} onClick={() => {
                            setSelectedCategory('');
                        }} />
                    }
                    {
                        categoriesForProject.map(category => <CategoryBox currentCategoryId={selectedCategory} category={category} onClick={() => {
                            setSelectedCategory(category.id);
                        }} />)
                    }
                    </div>
                    <Button text='New' onClick={async () => {
                        setShowNewTaskCategory(true);
                    }} className="ml-auto" />
                </div>
                <p>
                    {
                        !selectedCategory && 'General tasks for the project. These are tasks that are not associated with a specific category.'
                    }
                    {
                        selectedCategory && categoriesForProject.find(x => x.id === selectedCategory)?.description
                    }
                </p>
                {
                    majorFeatures && currentTasks && 
                    <SprintSection
                        user={user}
                        tasks={currentTasks.filter(x => x.onBoard).filter(x => (x.categoryId ?? '') === selectedCategory)}
                        majorFeatures={majorFeatures}
                        categories={categoriesForProject}
                    />
                }
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-4 items-center">
                    <span className="font-semibold">Backlog</span>
                </div>
                <div className="flex flex-col gap-[2px] overflow-y-auto scrollbar">
                    {
                        currentTasks && currentTasks.length === 0 &&
                        <div className="flex items-center justify-start h-14 w-full px-16">
                            No Active Tasks
                        </div>
                    }
                    {
                        currentTasks && currentTasks.filter(x => !x.onBoard).filter(x => (x.categoryId ?? '') === selectedCategory).sort((a, b) => a.id - b.id).map(task => <TaskBox user={user} key={task.id} task={task} profile={profiles.find(x => x.id === task.assigneeId)} categories={categories} />)
                    }
                </div>
                <Button text="Add New Task" onClick={async () => 
                {
                    if (currentTasks)
                    {
                        const task = new Task(project.id);
                        task.creatorId = user.id;
                        if (selectedCategory)
                            task.categoryId = selectedCategory;
                        await supabase.from('project_tickets').insert(task);
                        createNewNotification(profile, `${profile.name} Created A Task For ${project.name}`, `${profile.name} created a new task for the project ${project.name}`, profile.profilePictureURL);
                    }
                }} className="w-fit" />
            </div>
            </>
        }
        {/* New Task Modals go here because the <div> wrapper interferes with the flex wrapping... */}
        <NewTaskCategoryModal open={showNewTaskCategory} onClose={() => {setShowNewTaskCategory(false)}} projectId={project.id} />
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

    const contact = project.contractedContactId ? (await supabaseClient.from('contacts').select('*').eq('id', project.contractedContactId).single()).data as Contact : null;
    if (contact)
        contact.previewImageURL = supabaseClient.storage.from('contacts.pictures').getPublicUrl(contact.previewImageURL).data.publicUrl ?? '';

    const profile = (await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single()).data as Profile;
    profile.profilePictureURL = supabaseClient.storage.from('profile.pictures').getPublicUrl(profile.profilePictureURL).data.publicUrl!;

    const categories = (await supabaseClient.from('task_categories').select('*').eq('projectId', project.id)).data as TaskCategory[];

	return {
		props: {
			user: session?.user ?? null,
            profiles: profiles,
            project,
            contact,
            categories,
            profile
		}
	}
}