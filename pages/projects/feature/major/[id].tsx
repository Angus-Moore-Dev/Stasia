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
			<div className="flex-grow h-full flex flex-row gap-2">
				<div className="w-1/2 h-full flex flex-col gap-2">
					<span className="text-lg font-semibold">Editing Major Feature</span>
					<input value={majorFeature.name} onChange={(e) => setMajorFeature({...majorFeature, name: e.target.value})} className="p-2 w-full outline-none bg-tertiary rounded text-lg font-semibold" />
					<textarea value={majorFeature.description} onChange={(e) => setMajorFeature({...majorFeature, description: e.target.value})} className="p-2 w-full outline-none bg-tertiary rounded text-lg font-semibold h-96 scrollbar" placeholder="Edit Description Here" />
					<textarea value={majorFeature.objective} onChange={(e) => setMajorFeature({...majorFeature, objective: e.target.value})} className="p-2 w-full outline-none bg-tertiary rounded text-lg font-semibold h-96 scrollbar" placeholder="Edit Objective Here" />
				</div>
				<div className="w-2/3 h-full flex flex-col gap-1">
					<div className="flex flex-row items-center gap-2">
						<span>Minor Features</span>
						<Button text='Add Minor Feature' onClick={() => {
							const newMinorFeature = new MinorFeature();
							newMinorFeature.majorFeatureId = majorFeature.id;
							newMinorFeature.staffInvolved = majorFeature.peopleInvolved;
							setMinorFeatures(minorFeatures => [...minorFeatures, newMinorFeature]);
						}} />
					</div>
					<div className="w-full flex flex-row flex-wrap gap-2 mb-10">
					{
						minorFeatures.map(feature => <MinorFeatureBox key={feature.id} feature={feature} setFeature={(feature) => 
						{
							let features = [...minorFeatures];
							features[features.findIndex(x => x.id === feature.id)] = feature;
							setMinorFeatures(features);
						}} deleteMinorFeature={async () => {
							setMinorFeatures(minorFeatures.filter(x => x !== feature));
							const res = await supabase.from('project_minor_features').delete().eq('id', feature.id);
							createToast(res.error ? res.error.message : 'Successfully deleted minor feature', res.error !== null);
						}} />)
					}
					</div>
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