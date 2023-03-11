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
import createToast from "@/functions/createToast";

interface MajorFeatureProps
{
    majorFeatureData: MajorFeature;
	minorFeaturesData: MinorFeature[];
    user: User;
	profiles: Profile[];
}

export default function NewMajorFeature({ user, majorFeatureData, minorFeaturesData, profiles }: MajorFeatureProps)
{
    const router = useRouter();
	const [majorFeature, setMajorFeature] = useState(majorFeatureData);
	const [minorFeatures, setMinorFeatures] = useState<MinorFeature[]>(minorFeaturesData);

    return <div className='w-full h-full min-h-full flex flex-col items-center justify-start gap-4 max-w-[1920px] p-8 mx-auto'>
        <div className="w-full flex flex-row items-center justify-between">
            <Button text={`Back to Project`} onClick={() => {
                router.push(`/projects/${majorFeature.projectId}`);
            }} className="mr-auto" />
			<Button text='Update Major Feature' onClick={async () => {
				const featureRes = await supabase.from('project_major_features').update(majorFeature).eq('id', majorFeature.id);
				for (const minorFeature of minorFeatures)
				{
					const res = await supabase.from('project_minor_features').upsert(minorFeature);
					console.log(res);
					if (res.error)
					{
						createToast(res.error.message, true);
					}
				}

				if (featureRes.error)
				{
					createToast(featureRes.error.message, true);
				}
				else
				{
					createToast('Successfully Updated Major Feature', false);
				}
			}} className={`${majorFeature !== majorFeatureData && 'animate-pulse shadow-primary shadow-md'}`} />
		</div>
		<div className="flex-grow w-full flex flex-col gap-2">
			<div className="w-full flex flex-row gap-8">
				<div className="flex-grow w-1/2 flex flex-col gap-2 min-h-full">
					<span>Editing Major Feature</span>
					<input value={majorFeature.name} onChange={(e) => setMajorFeature({...majorFeature, name: e.target.value})} className="p-2 bg-tertiary font-medium w-full rounded outline-none" placeholder="Feature Name" />
					<div className="flex flex-row gap-2">
						<textarea value={majorFeature.description} onChange={(e) => setMajorFeature({...majorFeature, description: e.target.value})} className="p-2 bg-tertiary font-medium w-1/2 rounded h-80 outline-none" placeholder="Feature Description" />
						<textarea value={majorFeature.objective} onChange={(e) => setMajorFeature({...majorFeature, objective: e.target.value})} className="p-2 bg-tertiary font-medium w-1/2 rounded h-80 outline-none" placeholder="Objective" />
					</div>
				</div>
				<div className="flex-grow w-1/2 flex flex-col gap-2 min-h-full">
					<span>Staff Involved In This Feature</span>
					<div className="flex-grow flex flex-row gap-4">
						{
							profiles.map(profile => <button className="h-80 w-64 mb-10 flex text-left" 
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
									className="object-cover rounded-t-sm w-full min-w-[256px] min-h-[320px]"  />
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

	const majorFeature = (await supabaseClient.from('project_major_features').select('*').eq('id', context.query['id']).single()).data as MajorFeature;
	const staffInvolved = (await supabaseClient.from('profiles').select('*').in('id', majorFeature.peopleInvolved)).data as Profile[];
	const minorFeatures = (await supabaseClient.from('project_minor_features').select('*').eq('majorFeatureId', majorFeature.id)).data as MinorFeature[];
	for (const profile of staffInvolved)
	{
		profile.profilePictureURL = supabaseClient.storage.from('profile.pictures').getPublicUrl(profile.profilePictureURL).data.publicUrl;
	}
	return {
		props: {
			user: session?.user ?? null,
			majorFeatureData: majorFeature,
			minorFeaturesData: minorFeatures,
			profiles: staffInvolved,
		}
	}
}