import Button from "@/components/common/Button";
import { MajorFeatureBox, TaskBox } from "@/components/projects/FeatureBoxes";
import SprintSection from "@/components/projects/SprintSection";
import createNewNotification from "@/functions/createNewNotification";
import createToast from "@/functions/createToast";
import { supabase } from "@/lib/supabaseClient";
import { Contact } from "@/models/Contact";
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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AssignmentSharpIcon from '@mui/icons-material/AssignmentSharp';
import ForumSharpIcon from '@mui/icons-material/ForumSharp';
import KeySharpIcon from '@mui/icons-material/KeySharp';
import LibraryBooksSharpIcon from '@mui/icons-material/LibraryBooksSharp';
import ViewTimelineSharpIcon from '@mui/icons-material/ViewTimelineSharp';

interface ProjectIdPageProps
{
    user: User;
    profile: Profile;
    project: Project;
    profiles: Profile[];
    contact: Contact | null;
}

export default function ProjectIdPage({ user, project, profile, profiles, contact }: ProjectIdPageProps)
{
    const router = useRouter();
    const [majorFeatures, setMajorFeatures] = useState<MajorFeature[]>();

    useEffect(() => {
        supabase.from('project_major_features').select('*').eq('projectId', project.id).then(res => 
        {
            setMajorFeatures(res.data as MajorFeature[]);
        });
    }, []);


    return <div className='w-full min-h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto'>
        <div className="w-full flex flex-row items-center">
            <Button text='Back to Projects' onClick={() => {
                router.push('/projects');
            }} className="mr-auto" />
            <Button text='Edit Project Details' onClick={() => {
                router.push(`/projects/edit?id=${project.id}`);
            }} />
            <Button text='Invite External User' onClick={() => {
                alert('todo!');
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
                                className="object-cover rounded-t-sm w-full min-w-[256px] min-h-[320px]"
                            />
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
            <div className="flex flex-col w-full gap-2">
                <span className="font-semibold">Project Services</span>
                <section className="flex flex-row flex-wrap w-full gap-2 justify-center items-center">
                    <Link href={`/projects/${project.id}/tasks`} className="w-full md:w-[19.5%] min-w-[200px] h-48 bg-tertiary hover:bg-primary hover:text-secondary transition hover:bg-green font-bold text-lg flex flex-col items-center justify-center gap-2 rounded p-4 border-b-4 border-b-primary">
                        <div className="flex flex-row items-center gap-2">
                            <AssignmentSharpIcon fontSize="large" />
                            <span className="pt-[2px]">Tasks</span>
                        </div>
                    </Link>
                    <Link href={`/projects/${project.id}/discussion`} className="w-full md:w-[19.5%] min-w-[200px] h-48 bg-tertiary hover:bg-primary hover:text-secondary transition hover:bg-green font-bold text-lg flex flex-col items-center justify-center gap-2 rounded p-4 border-b-4 border-b-primary">
                        <div className="flex flex-row items-center gap-2">
                            <ForumSharpIcon fontSize="large" />
                            <span className="pt-[2px]">Discussion</span>
                        </div>
                    </Link>
                    <Link href={`/projects/${project.id}/roadmap`} className="w-full md:w-[19.5%] min-w-[200px] h-48 bg-tertiary hover:bg-primary hover:text-secondary transition hover:bg-green font-bold text-lg flex flex-col items-center justify-center gap-2 rounded p-4 border-b-4 border-b-primary">
                        <div className="flex flex-row items-center gap-2">
                            <ViewTimelineSharpIcon fontSize="large" />
                            <span className="pt-[2px]">Roadmap</span>
                        </div>
                    </Link>
                    <Link href={`/projects/${project.id}/documentation`} className="w-full md:w-[19.5%] min-w-[200px] h-48 bg-tertiary hover:bg-primary hover:text-secondary transition hover:bg-green font-bold text-lg flex flex-col items-center justify-center gap-2 rounded p-4 border-b-4 border-b-primary">
                        <div className="flex flex-row items-center gap-2">
                            <LibraryBooksSharpIcon fontSize="large" />
                            <span className="pt-[2px]">Documentation</span>
                        </div>
                    </Link>
                    <Link href={`/projects/${project.id}/secrets`} className="w-full md:w-[19.5%] min-w-[200px] h-48 bg-tertiary hover:bg-primary hover:text-secondary transition hover:bg-green font-bold text-lg flex flex-col items-center justify-center gap-2 rounded p-4 border-b-4 border-b-primary">
                        <div className="flex flex-row items-center gap-2">
                            <KeySharpIcon fontSize="large" />
                            <span className="pt-[2px]">Secrets Management</span>
                        </div>
                    </Link>
                </section>
            </div>
            <div className="flex flex-col w-full">
                <div className="flex flex-row gap-4 items-center">
                    <span className="font-semibold">Major Features</span>
                    <Button text="Add New Feature" onClick={() => {
                        router.push(`/projects/feature/major/new?id=${project.id}`)
                    }} />
                </div>
                <span>
                    Click on a major feature to view its minor features and associated tasks. <br />
                    Mark as uncompleted if more work needs doing.
                </span>
                <div className="w-full flex flex-row flex-wrap gap-2 items-center pt-2">
                {
                    majorFeatures && majorFeatures.map(feature => <MajorFeatureBox feature={feature} />)
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

	return {
		props: {
			user: session?.user ?? null,
            profiles: profiles,
            project,
            contact,
            profile
		}
	}
}