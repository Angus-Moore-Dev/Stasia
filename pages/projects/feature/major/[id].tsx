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
import createNewNotification from "@/functions/createNewNotification";
import FeatureDeletionDialog from "@/components/projects/FeatureDeletionDialog";

interface MajorFeatureProps
{
    majorFeatureData: MajorFeature;
    user: User;
	profiles: Profile[];
	profile: Profile;
}

export default function NewMajorFeature({ user, majorFeatureData, profiles, profile }: MajorFeatureProps)
{
    const router = useRouter();
	const [majorFeature, setMajorFeature] = useState(majorFeatureData);
	const [completed, setCompleted] = useState(majorFeatureData.completed);
	const [showDeletionDialog, setShowDeletionDialog] = useState(false);

    return <div className='w-full h-full min-h-full flex flex-col items-center justify-start gap-4 max-w-[1920px] p-8 mx-auto'>
        <div className="w-full flex flex-row items-center justify-start">
            <Button text={`Back to Project`} onClick={() => {
                router.push(`/projects/${majorFeature.projectId}`);
            }} className="mr-auto" />
			<Button text='Update Major Feature' onClick={async () => {
				const featureRes = await supabase.from('project_major_features').update(majorFeature).eq('id', majorFeature.id);

				if (featureRes.error)
				{
					createToast(featureRes.error.message, true);
				}
				else
				{
					createToast('Successfully Updated Major Feature', false);
				}
			}} className={`${majorFeature !== majorFeatureData && 'animate-pulse shadow-primary shadow-md'}`} />
			{
				!completed &&
				<Button text='Complete Major Feature' onClick={async () => {
					const res = await supabase.from('project_major_features').update({
						completed: true
					}).eq('id', majorFeature.id);
					if (res.error)
						createToast(res.error.message, true);
					else
					{
						setCompleted(true);
						createToast('Marked Feature As Complete!', false);
						createNewNotification(profile, `${profile.name} Marked a Major Feature As Complete`, `${profile.name} marked a major feature as complete, ${majorFeature.name}.`, profile.profilePictureURL);
					}
				}} className={`${majorFeature !== majorFeatureData && 'animate-pulse shadow-primary shadow-md'}`} />
			}
			{
				completed &&
				<Button text='Mark as Not Complete' onClick={async () => {
					const res = await supabase.from('project_major_features').update({
						completed: false
					}).eq('id', majorFeature.id);
					if (res.error)
						createToast(res.error.message, true);
					else
					{
						createToast('Feature Marked As Not Complete', false);
						setCompleted(false);						
					}
				}} className='text-red-500 hover:bg-red-500 hover:text-zinc-100' />
			}
			<Button text='Delete Major Feature' onClick={async () => {
				setShowDeletionDialog(true);
			}} className="text-red-500 hover:bg-red-500 hover:text-zinc-100" />
			<FeatureDeletionDialog show={showDeletionDialog} setShow={setShowDeletionDialog} feature={majorFeature}  />
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
	for (const profile of staffInvolved)
	{
		profile.profilePictureURL = supabaseClient.storage.from('profile.pictures').getPublicUrl(profile.profilePictureURL).data.publicUrl;
	}

	const profile = (await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single()).data as Profile;
    profile.profilePictureURL = supabase.storage.from('profile.pictures').getPublicUrl(profile.profilePictureURL).data.publicUrl!;

	return {
		props: {
			user: session?.user ?? null,
			majorFeatureData: majorFeature,
			profiles: staffInvolved,
			profile: profile,
		}
	}
}