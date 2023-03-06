import LoadingBox from "@/components/LoadingBox";
import Button from "@/components/common/Button";
import { computeHash } from "@/functions/computeHash";
import { supabase } from "@/lib/supabaseClient";
import { LinearProgress } from "@mui/material";
import { User, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { toast } from "react-toastify";
import remarkGfm from "remark-gfm";

interface EditDocumentWindowProps
{
    user: User;
	fileId: string; // includes the directory.
}

export default function EditDocumentWindow({ user, fileId }: EditDocumentWindowProps)
{
    const router = useRouter();
	const [fileContents, setFileContents] = useState<string>();
	const [computedHash, setComputedHash] = useState(0);
	const [initialHash, setInitialHash] = useState(0);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		setComputedHash(computeHash(fileContents ?? ''));
	}, [fileContents]);

	useEffect(() => {
		supabase.storage.from('general.files').download(fileId).then(async res => {
			if (res.data)
			{
				const fileReader = new FileReader();
				fileReader.onloadend = (e) => 
				{
					setInitialHash(computeHash(e.target?.result as string));
					console.log((e.target?.result as string).length);
					setFileContents((e.target?.result as string) ? e.target?.result as string : '# New Document');
				}
				fileReader.readAsText(res?.data);
			}
		})
	}, [fileId]);
    return <div className='w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto'>
        <div className="w-full flex flex-row items-center gap-4">
			<Button text='Back to Files' onClick={() => {
				router.push('/files');
			}} />
			<span className="">Editing <b>{fileId.split('/')[1]}</b></span>
			{
				isSaving &&
				<LinearProgress color='inherit' className="text-primary h-4 w-48 rounded-sm ml-auto" />
			}
			{
				computedHash !== initialHash && fileContents && !isSaving &&
				<Button text='Save Document' onClick={async () => {
					setIsSaving(true);
					const file = new File([fileContents], fileId, 
					{
						type: 'text/markdown',
						lastModified: Date.now()
					});
					const res = await supabase.storage.from('general.files').update(fileId, file);
					if (res.error)
					{
						toast.error(res?.error?.message, 
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
						setInitialHash(computedHash);
						toast.success('File Saved Successfully.',
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
					}
					setIsSaving(false);
				}} className="ml-auto" />
			}
		</div>
		<div className="flex-grow w-full bg-tertiary flex flex-col rounded">
			<div className="w-full flex flex-row bg-quaternary rounded-t">
				<div className="w-1/2 px-8">
					Editor
				</div>
				<div className="w-1/2 px-8">
					Preview
				</div>
			</div>
			<div className="flex-grow flex flex-row">
				{
					fileContents === undefined &&
					<div className="flex-grow flex flex-col items-center justify-center">
						<LoadingBox />
						<small>Loading Document</small>
					</div>
				}
				{
					fileContents !== undefined &&
					<>
					<textarea className="w-1/2 h-full bg-transparent rounded-l p-4 outline-none scrollbar" placeholder="Enter Text" value={fileContents} onChange={(e) => setFileContents(e.target.value)} />
					<div className="px-4 py-2 my-2 border-l-4 border-l-quaternary">
						<ReactMarkdown remarkPlugins={[remarkGfm]} className="scrollbar whitespace-pre">
							{fileContents}
						</ReactMarkdown>
					</div>
					</>
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

	return {
		props: {
			user: session?.user ?? null,
			fileId: context.query['id'] as string
		}
	}
}