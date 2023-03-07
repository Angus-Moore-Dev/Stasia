import { supabase } from "@/lib/supabaseClient";
import { FileData } from "@/models/files/FileMetadata";
import { Box, LinearProgress, Modal } from "@mui/material";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '75vw',
    border: '0px solid',
    outline: 'none'
};

interface NewFileModalProps
{
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    currentFolderId: string;
    setCurrentFolderId: Dispatch<SetStateAction<string>>;
    setRefreshing: Dispatch<SetStateAction<boolean>>;
    file: FileData;
    isFolder: boolean;
    allFilesInPath: string[];
    setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export default function RenameFolder({ show, setShow, setRefreshing, currentFolderId, file, allFilesInPath, setIsLoading }: NewFileModalProps)
{
    const router = useRouter();
    const handleClose = () => setShow(false);
    const [isValidFolderName, setIsValidFolderName] = useState(true);
    const [fileName, setFileName] = useState(file.name);
    const [isCreatingNewFile, setIsCreatingNewFile] = useState(false);
    const [fileNameTaken, setFileNameTaken] = useState(false);

    const renameFile = async () => 
    {
        if (allFilesInPath.some(x => x === fileName))
        {
            setFileNameTaken(true);
        }
        else
        {
            setIsLoading(true);
            await renameFolder(currentFolderId, file.name, fileName);
            setIsLoading(false);
            setRefreshing(true);
        }
    }

    useEffect(() => {
        if (!show)
        {
            setIsValidFolderName(false);
            setFileName('');
            setFileNameTaken(false);
        }
        else
        {
            setIsValidFolderName(true);
            setFileName(file.name);
        }
    }, [show]);


    return <div>
        <Modal
            open={show}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div className="w-full h-full flex flex-col rounded bg-quaternary min-w-[500px]">
                    <div className="py-1 flex flex-row items-center justify-between px-8">
                        <span>Rename Folder</span>
                    </div>
                    <div className="flex-grow bg-secondary p-8 flex items-center justify-center rounded-b flex-col">
                        <input spellCheck={false} autoFocus={true} value={fileName} onChange={(e) => {
                            if (/[`!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/.test(e.target.value))
                            {
                                setIsValidFolderName(false);
                            }
                            else
                            {
                                setIsValidFolderName(true);
                            }
                            setFileNameTaken(false);
                            setFileName(e.target.value);
                        }} pattern="[A-Za-z0-9]" maxLength={48} 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isValidFolderName)
                            {
                                renameFile();
                            }
                        }}
                        className="px-4 py-1 outline-none bg-tertiary rounded w-full font-semibold aria-disabled:text-red-500"
                        aria-disabled={!isValidFolderName || fileNameTaken}
                        placeholder='Folder Name' />
                        {
                            !isValidFolderName && fileName &&
                            <small className="w-full pt-1">Invalid folder name. No special characters.</small>
                        }
                        {
                            fileNameTaken &&
                            <small className="w-full pt-1">This file name exists already.</small>
                        }
                    </div>
                    {
                        isCreatingNewFile &&
                        <LinearProgress color='inherit' className='text-primary h-5 rounded-b-sm w-full px-4' />
                    }
                    {
                        !isCreatingNewFile &&
                        <div className="w-full flex flex-row items-center">
                            <button className="w-1/2 px-2 py-1 rounded text-red-500 font-semibold transition hover:text-zinc-100 hover:bg-red-500"
                            onClick={() => setShow(false)}>
                                Cancel
                            </button>
                            {
                                isValidFolderName && fileName &&
                                <button className="w-1/2 px-2 py-1 rounded text-primary font-semibold transition hover:text-zinc-100 hover:bg-primary"
                                onClick={() => renameFile()}>
                                    Rename
                                </button>
                            }
                        </div>
                    }
                </div>
            </Box>
        </Modal>
    </div>
}


/**
 * 
 * @param path the path to the current folder (folder/subfolder/)
 * @param folderName the name of the existing folder ([path][fileName])
 * @param newFolderName the name of the new folder ([path][newFileName]), this never changes.
 */
async function renameFolder(path: string, folderName: string, newFolderName: string): Promise<void>
{
    await moveFilesInFolder(path ? `${path}/${folderName}` : folderName, path ? `${path}/${newFolderName}` : newFolderName);
}


async function moveFilesInFolder(oldPath: string, newPath: string)
{
    const filesInDirectory = (await supabase.storage.from('general.files').list(oldPath)).data as unknown as FileData[];
    for (const file of filesInDirectory.filter(x => x.metadata !== null))
        await supabase.storage.from('general.files').move(`${oldPath}/${file.name}`, `${newPath}/${file.name}`);
    for (const folder of filesInDirectory.filter(x => x.metadata === null))
        await moveFilesInFolder(`${oldPath}/${folder.name}`, `${newPath}/${folder.name}`);
}