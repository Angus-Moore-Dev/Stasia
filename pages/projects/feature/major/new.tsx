import Button from "@/components/common/Button";
import { Profile } from "@/models/me/Profile";
import { MajorFeature } from "@/models/projects/MajorFeature";
import { Project } from "@/models/projects/Project";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { MinorFeature } from "@/models/projects/MinorFeature";
import { MinorFeatureBox } from "@/components/projects/FeatureBoxes";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import createNewNotification from "@/functions/createNewNotification";
import createToast from "@/functions/createToast";

interface MajorFeatureProps
{
    projectId: string;
	projectName: string;
    user: User;
	profiles: Profile[];
	profile: Profile;
}

export default function NewMajorFeature({ user, projectName, projectId, profiles, profile }: MajorFeatureProps)
{
    const router = useRouter();
	const [majorFeature, setMajorFeature] = useState(new MajorFeature(projectId));
	const [minorFeatures, setMinorFeatures] = useState<MinorFeature[]>([]);
	useEffect(() => console.log(minorFeatures), [minorFeatures]);

    return <div className='w-full h-full min-h-full flex flex-col items-center justify-start gap-4 max-w-[1920px] p-8 mx-auto'>
        <div className="w-full flex flex-row items-center justify-between">
            <Button text={`Back to ${projectName}`} onClick={() => {
                router.push(`/projects/${projectId}`);
            }} className="mr-auto" />
			<Button text='Create Major Feature' onClick={async () => 
			{
                const featureRes = await supabase.from('project_major_features').insert(majorFeature);
				if (featureRes.error)
				{
					// show error toast here.
					toast.error(featureRes.error?.message, 
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
				for (const minorFeature of minorFeatures)
				{
					const res = await supabase.from('project_minor_features').insert(minorFeature);
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
				}
				if (!featureRes.error)
				{
					createToast('Created New Feature!', false);
					await createNewNotification(profile, `${profile.name} Created A New Major Feature`, `${profile.name} created a new feature for the project ${projectName}, ${majorFeature.name}.`, profile.profilePictureURL);
					router.push(`/projects/${projectId}`);
				}
            }} className="" />
        </div>
		<div className="w-full flex flex-row gap-8">
			<div className="flex-grow w-1/2 flex flex-col gap-2 min-h-full">
				<span>Create A New Major Feature for <b>{projectName}</b></span>
				<input value={majorFeature.name} onChange={(e) => setMajorFeature({...majorFeature, name: e.target.value})} className="p-2 bg-tertiary font-medium w-full rounded outline-none" placeholder="Feature Name" />
				<div className="flex flex-row gap-2 h-full">
					<textarea value={majorFeature.description} onChange={(e) => setMajorFeature({...majorFeature, description: e.target.value})} className="p-2 bg-tertiary font-medium w-1/2 rounded h-full outline-none" placeholder="Feature Description" />
					<textarea value={majorFeature.objective} onChange={(e) => setMajorFeature({...majorFeature, objective: e.target.value})} className="p-2 bg-tertiary font-medium w-1/2 rounded h-full outline-none" placeholder="Objective" />
				</div>
			</div>
			<div className="flex-grow w-3/5 flex flex-col gap-2">
				<span>Staff Involved In This Feature</span>
				<div className="w-full max-h-[50vh] flex flex-row flex-wrap gap-4 overflow-auto">
					{
                        profiles.map(profile => <button className="h-96 w-64 mb-10 flex text-left" 
                        onClick={() => {
                            if (!majorFeature.peopleInvolved.some(x => x === profile.id))
                                setMajorFeature({...majorFeature, peopleInvolved: [...majorFeature.peopleInvolved, profile.id]})
                            else
                                setMajorFeature({...majorFeature, peopleInvolved: majorFeature.peopleInvolved.filter(x => x !== profile.id)});
                        }}>
                            <div className="group w-full h-full rounded bg-tertiary text-zinc-100 font-medium hover:cursor-pointer flex flex-col">
                                <Image 
                                priority={true}
                                src={profile.profilePictureURL} 
                                alt='profile' 
                                width='600' height='400' 
                                className="object-cover rounded-t-sm w-full min-w-[256px] min-h-[384px]"  />
                                <div className="p-2 flex flex-col gap-2 bg-tertiary rounded-b transition group-hover:bg-primary group-hover:text-secondary aria-selected:bg-primary aria-selected:text-secondary"
                                aria-selected={majorFeature.peopleInvolved.some(x => x === profile.id)}>
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
		<div className="flex flex-col w-full items-center">
			<div className="w-full flex flex-row items-center gap-4">
				<span className="">Minor Features</span>
				<Button text='Add Minor Feature' onClick={() => {
					const newMinorFeature = new MinorFeature();
					newMinorFeature.majorFeatureId = majorFeature.id;
					newMinorFeature.staffInvolved = majorFeature.peopleInvolved;
					setMinorFeatures(minorFeatures => [...minorFeatures, newMinorFeature]);
				}} />
			</div>
			<span className="w-full">A minor feature is an isolated component that is required to make the major feature work. A small part of a bigger picture.</span>
		</div>
		<div className="w-full flex flex-row flex-wrap gap-2 pb-10">
			{
				minorFeatures.map(feature => <MinorFeatureBox key={feature.id} feature={feature} setFeature={(feature) => 
				{
					let features = [...minorFeatures];
					features[features.findIndex(x => x.id === feature.id)] = feature;
					setMinorFeatures(features);
				}} deleteMinorFeature={() => {
					console.log('deleting::', feature.id);
					setMinorFeatures(minorFeatures.filter(x => x !== feature));
				}} />)
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

	const project = (await supabaseClient.from('projects').select('id, name, peopleInvolved').eq('id', context.query['id']).single()).data as Project;
	const staffInvolved = (await supabaseClient.from('profiles').select('*').in('id', project.peopleInvolved)).data as Profile[];
	for (const profile of staffInvolved)
	{
		profile.profilePictureURL = supabaseClient.storage.from('profile.pictures').getPublicUrl(profile.profilePictureURL).data.publicUrl;
	}

	const profile = (await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single()).data as Profile;
    profile.profilePictureURL = supabaseClient.storage.from('profile.pictures').getPublicUrl(profile.profilePictureURL).data.publicUrl!;


	return {
		props: {
			user: session?.user ?? null,
			projectName: project.name,
            projectId: project.id,
			profiles: staffInvolved,
			profile: profile,
		}
	}
}