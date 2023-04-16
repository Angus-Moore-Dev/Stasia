import LoadingBox from "@/components/LoadingBox";
import Button from "@/components/common/Button";
import File from "@/components/files/File";
import FileUploadModal from "@/components/files/FileUploadModal";
import NewFileModal from "@/components/files/NewFileModal";
import NewFolderModal from "@/components/files/NewFolderModal";
import { supabase } from "@/lib/supabaseClient";
import { FileData } from "@/models/files/FileMetadata";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";


interface FilesPageProps
{
    user: User;
}

export default function FilesPage({ user }: FilesPageProps)
{
	const [files, setFiles] = useState<FileData[]>();
	const [currentFolderId, setCurrentFolderId] = useState('');
	const [activeContextMenu, setactiveContextMenu] = useState(''); // always set away
	const [isLoading, setIsLoading] = useState(true);

	// Modals
	const [showNewFolderModal, setShowNewFolderModal] = useState(false);
	const [showFileUploadModal, setShowFileUploadModal] = useState(false);
	const [showNewFileModal, setShowNewFileModal] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const listFiles = async () => 
	{
		setIsLoading(true);
		// This is called for the base directory, and is then called again for each subfolder it's in.
		const { data, error } = await supabase.storage.from('general.files').list(currentFolderId);
		setFiles(data as unknown as FileData[]);
		setIsLoading(false);
	}

	useEffect(() => {
		listFiles();
	}, [currentFolderId]);

	useEffect(() => {
		if (isRefreshing)
		{
			listFiles();
			setIsRefreshing(false);
		}
	}, [isRefreshing]);

	useEffect(() => {
		const listener = () => 
		{
			setactiveContextMenu('');
		}
		window.addEventListener('click', listener);
		return () => window.removeEventListener('click', listener);
	}, []);

    return <div className='w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto'>
		<div className="w-full flex items-center gap-2">
			<p className="mr-auto">Files</p>
			<Button text='New Folder' onClick={() => setShowNewFolderModal(true)} />
			<Button text='Upload File' onClick={() => setShowFileUploadModal(true)} />
			<Button text='New Document' onClick={() => setShowNewFileModal(true)} />
			<FileUploadModal show={showFileUploadModal} setShow={setShowFileUploadModal} filePath={currentFolderId} setComplete={setIsRefreshing} />
			<NewFolderModal show={showNewFolderModal} setShow={setShowNewFolderModal} setRefreshing={setIsRefreshing} currentFolderId={currentFolderId} setCurrentFolderId={setCurrentFolderId} />
			<NewFileModal show={showNewFileModal} setShow={setShowNewFileModal} setRefreshing={setIsRefreshing} currentFolderId={currentFolderId} setCurrentFolderId={setCurrentFolderId} allFileNamesInFolder={files?.map(x => x.name) ?? []} />
		</div>
		<div className="w-full mx-auto flex-grow flex flex-col bg-quaternary rounded">
			<div className="px-8 bg-tertiary py-4 rounded-t font-medium">
				<button className="transition hover:text-primary" onClick={() => setCurrentFolderId('')}>jensen_labs</button>
				{
					currentFolderId.split('/').map((folderName, index) => {
						return (
							<>
							/
							<button className="transition hover:text-primary" onClick={() => setCurrentFolderId(currentFolderId.split('/').slice(0, index + 1).map(x => x).join('/'))}>
								{folderName.toLowerCase()}
							</button>
							</>
						)
					})
				}
			</div>
			<div className="w-full flex flex-row flex-wrap items-center px-8 mt-4 pb-4">
				<span className="">Type</span>
				<span className="w-3/5 pl-6">Name</span>
				<div className="flex-grow flex flex-row justify-between">
					<span className="">Last Modified</span>
					<span className="pr-2">Size</span>
				</div>
			</div>
			{
				(!files || isLoading || isRefreshing) && <div className="flex-grow flex justify-center items-center">
					<LoadingBox />
				</div>
			}
			{
				files && !isLoading && !isRefreshing && files?.filter(x => x.name !== 'IGNORE.stasia').map(file => <File 
					file={file} 
					currentFolderId={currentFolderId} 
					setFolderListId={setCurrentFolderId} 
					activeContextMenu={activeContextMenu} 
					setActiveContextMenu={setactiveContextMenu}
					setRefreshing={setIsRefreshing} 
					setIsLoading={setIsLoading}
					allFilesInDirectory={files.map(x => x.name)}
					/>
				)
			}
			{
				files && !isLoading && !isRefreshing && files.filter(x => x.name !== 'IGNORE.stasia').length === 0 &&
				<div className="flex-grow flex items-center justify-center">
					There are no files in this folder
				</div>
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
	return {
		props: {
			user: session?.user ?? null
		}
	}
}
