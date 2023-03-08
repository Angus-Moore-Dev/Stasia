
import Button from "@/components/common/Button";
import { Profile } from "@/models/me/Profile";
import { CommercialisationType, Project, ProjectType } from "@/models/projects/Project";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js"
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import Image from "next/image";
import { Contact } from "@/models/Contact";
import { supabase } from "@/lib/supabaseClient";
import { v4 } from "uuid";
import { toast } from "react-toastify";

interface ProectsPageProps
{
    user: User;
    profiles: Profile[];
    contacts: Contact[];
}

export default function NewProjectPage({ user, profiles, contacts }: ProectsPageProps)
{
    const router = useRouter();
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projectType, setProjectType] = useState<ProjectType>();
    const [commercialisationType, setCommercialisationType] = useState<CommercialisationType>();
    const [industry, setIndustry] = useState('');
    const [staffInvolved, setStaffInvolved] = useState<string[]>([]);
    const [contractedContactId, setContractedContactId] = useState(''); // For contracts only.

    return <div className='w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto'>
        <div className="w-full flex items-center gap-2">
            <Button text='Back to Projects' onClick={() => {
                router.push('/projects');
            }} className="mr-auto" />
            <Button text='Create Project' onClick={async () => {
                const project = new Project();
                project.id = v4();
                project.name = projectName;
                project.created_at = new Date(Date.now()).toISOString();
                project.description = projectDescription;
                project.industry = industry;
                project.peopleInvolved = staffInvolved;
                project.projectType = projectType ?? ProjectType.Other;
                project.commercialisationType = commercialisationType ?? CommercialisationType.None;
                project.contractedContactId = contractedContactId;
                const res = await supabase.from('projects').insert(project);
                if (res.error)
                {
                    toast.error(res.error?.message, 
                    {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                        style: { backgroundColor: '#090909', color: '#ef4444', fontFamily: 'Rajdhani', fontWeight: '800' }
                    });
                }
                else
                {
                    toast.success(`Project ${project.name} has been created.`,
                    {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                        style: { backgroundColor: '#00fe49', color: '#090909', fontFamily: 'Rajdhani', fontWeight: '800' }
                    });
                    router.push(`/projects/${project.id}`);
                }
            }} />
        </div>
        <div className="flex-grow flex flex-row gap-4 justify w-full min-h-full">
            <div className='w-1/2 flex flex-col gap-4'>
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
                <div className="w-full flex flex-row flex-wrap gap-2">
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
                        {
                        commercialisationType === CommercialisationType.Contractual &&
                        <div className="flex flex-col gap-2">
                            <span>Select Contact</span>
                            <select defaultValue='' className="bg-tertiary transition" onChange={(e) => {
                                setContractedContactId(e.target.value);
                            }}>
                                {
                                    contacts.map(contact => <option value={contact.id} className="bg-tertiary transition hover:bg-primary hover:text-secondary">{contact.name}</option>)
                                }
                            </select>
                        </div>
                        }
                    </div>
                    
                </div>
            </div>
            <div className="w-1/2 flex flex-col gap-4">
                <span>Staff Involved (Click to Apply)</span>
                <div className="w-full max-h-full flex flex-row gap-4 flex-wrap overflow-y-auto scrollbar pb-10">
                    {
                        profiles.map(profile => <button className="h-80 w-64 mb-10 flex text-left " 
                        onClick={() => {
                            if (staffInvolved.some(x => x === profile.id))
                                setStaffInvolved(staffInvolved.filter(x => x !== profile.id));
                            else
                                setStaffInvolved(staffInvolved => [...staffInvolved, profile.id]);
                        }}>
                            <div className="group w-full h-full rounded bg-tertiary text-zinc-100 font-medium hover:cursor-pointer flex flex-col">
                                <Image 
                                priority={true}
                                src={profile.profilePictureURL} 
                                alt='profile' 
                                width='600' height='400' 
                                className="object-cover rounded-t-sm w-full min-w-[256px] min-h-[320px]"  />
                                <div className="p-2 flex flex-col gap-2 bg-tertiary rounded-b transition group-hover:bg-primary group-hover:text-secondary aria-selected:bg-primary aria-selected:text-secondary"
                                aria-selected={staffInvolved.some(x => x === profile.id)}>
                                    <p className="text-lg font-medium">{profile.name}</p>
                                    <span>{profile.role}</span>
                                </div>
                            </div>
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

    const { data, error } = await supabaseClient.from('profiles').select('*');
    const profiles = data as Profile[];
    const contacts = (await supabaseClient.from('contacts').select('id, name')).data as Contact[];

    for (const profile of profiles)
    {
        profile.profilePictureURL = supabaseClient.storage.from('profile.pictures').getPublicUrl(profile.profilePictureURL).data.publicUrl;
    }

	return {
		props: {
			user: session?.user ?? null,
            profiles: profiles,
            contacts: contacts
		}
	}
}