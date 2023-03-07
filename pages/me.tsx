import Button from "@/components/common/Button";
import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/models/me/Profile";
import { LinearProgress } from "@mui/material";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

interface MePageProps
{
	user: User;
	profile: Profile;
}

export default function MePage({ user, profile }: MePageProps)
{
	const fileRef = useRef<HTMLInputElement>(null);
	const [showSaveChanges, setShowSaveChanges] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [profilePictureFile, setProfilePictureFile] = useState<File>();
	const [profilePictureURL, setProfilePictureURL] = useState(profile.profilePictureURL);
	const updateProfilePicture = async () =>
	{
		if (profilePictureFile)
		{
			setIsUploading(true);
			await supabase.storage.from('profile.pictures').remove([profile.profilePictureURL]);
			await supabase.storage.from('profile.pictures').upload(profilePictureFile.name, profilePictureFile);
			await supabase.from('profiles').update({
				profilePictureURL: profilePictureFile.name
			}).eq('id', profile.id);
			setShowSaveChanges(false);
			setIsUploading(false);
		}
	}

	useEffect(() => {
		return () => URL.revokeObjectURL(profilePictureURL);
	}, []);


    return (
        <div className="w-full h-full flex flex-col gap-6 max-w-[1920px] mx-auto p-8">
            <div className="w-full flex flex-row gap-6">
				<input type='file' ref={fileRef} hidden accept="image/*" onChange={(e) => {
					if (e.target.files)
					{
						const newProfilePic = e.target.files[0];
						setProfilePictureURL(URL.createObjectURL(newProfilePic));
						setProfilePictureFile(newProfilePic);
						setShowSaveChanges(true);
					}
				}} />
				<div className="flex flex-col items-end">
					<div className="w-[450px] h-[450px]">
						<Image src={profilePictureURL} alt='Profile Picture' width='450' height='450' className="w-full h-full rounded object-cover hover:cursor-pointer transition hover:shadow-md hover:shadow-primary" onClick={async () => {
							fileRef.current?.click();
						}} />
					</div>
					{
						isUploading &&
						<LinearProgress color='inherit' className='text-primary h-5 rounded-b-sm px-4 w-32' />
					}
					{
						showSaveChanges && !isUploading &&
						<Button text='Upload New Profile Pic' onClick={() => updateProfilePicture()} className="w-fit mt-2" />
					}
				</div>
				<div className="flex flex-col gap-2">
					<p className="text-8xl font-semibold">{profile.name}</p>
					<p className="text-4xl font-medium">{profile.role}</p>
					<p className="font-medium text-lg">{profile.location}</p>
					<p>{profile.team}</p>
					<p>Employee ID: <b>{profile.id}</b></p>
				</div>
			</div>
        </div>
    )
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

	const profile = (await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single()).data as unknown as Profile;
	profile.profilePictureURL = (await supabaseClient.storage.from('profile.pictures').getPublicUrl(profile.profilePictureURL)).data.publicUrl ?? '';

	return {
		props: {
			user: session?.user ?? null,
			profile: profile
		}
	}
}