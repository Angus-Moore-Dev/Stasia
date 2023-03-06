import { supabase } from "@/lib/supabaseClient";
import { FileData } from "@/models/files/FileMetadata";
import { Box, LinearProgress, Modal, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from 'next/image';
import LoadingBox from "../LoadingBox";
import ShareSharpIcon from '@mui/icons-material/ShareSharp';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import Button from "../common/Button";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '75vw',
    border: '0px solid',
    outline: 'none'
};

interface NewFolderModalProps
{
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    currentFolderId: string;
    setCurrentFolderId: Dispatch<SetStateAction<string>>;
    setRefreshing:Dispatch<SetStateAction<boolean>>;
}

export default function NewFolderModal({ show, setShow, setRefreshing, currentFolderId, setCurrentFolderId }: NewFolderModalProps)
{
    const handleClose = () => setShow(false);
    const [isValidFolderName, setIsValidFolderName] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [isCreatingNewFolder, setisCreatingNewFolder] = useState(false)
    const createNewFolder = async () => 
    {
        // Because Supabase doesn't allow empty folders, we create a folder with a new file called 'IGNORE.stasia', which is our blank file for holding the folder.
        // When a folder gets deleted, all that happens is that file is deleted, triggering the folder deletion.
        setisCreatingNewFolder(true);
        const moddedFolderName = folderName.replaceAll(' ', '_');
        const file = new File([], 'IGNORE.stasia');
        const filePath = currentFolderId ? `${currentFolderId}/${moddedFolderName}/${file.name}` : `${moddedFolderName}/${file.name}`;
        await supabase.storage.from('general.files').upload(filePath, file);
        setShow(false);
        setCurrentFolderId(currentFolderId ? `${currentFolderId}/${moddedFolderName}` : `${moddedFolderName}`);
    }

    useEffect(() => {
        if (!show)
        {
            setIsValidFolderName(false);
            setFolderName('');
            setisCreatingNewFolder(false);
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
                        <span>New Folder</span>
                    </div>
                    <div className="flex-grow bg-secondary p-8 flex items-center justify-center rounded-b flex-col">
                        <input value={folderName} onChange={(e) => {
                            if (/[`!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/.test(e.target.value))
                            {
                                setIsValidFolderName(false);
                            }
                            else
                            {
                                setIsValidFolderName(true);
                            }
                            setFolderName(e.target.value);
                        }} pattern="[A-Za-z0-9]" maxLength={48} 
                        className="px-4 py-1 outline-none bg-tertiary rounded w-full font-semibold aria-disabled:text-red-500"
                        aria-disabled={!isValidFolderName}
                        placeholder="Folder Name" 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isValidFolderName)
                            {
                                createNewFolder();
                            }
                        }}
                        />
                        {
                            !isValidFolderName && folderName &&
                            <small className="w-full pt-1">Invalid folder name. No special characters.</small>
                        }
                    </div>
                    {
                        isCreatingNewFolder &&
                        <LinearProgress color='inherit' className='text-primary h-5 rounded-b-sm w-full px-4' />
                    }
                    {
                        !isCreatingNewFolder &&
                        <div className="w-full flex flex-row items-center">
                            <button className="w-1/2 px-2 py-1 rounded text-red-500 font-semibold transition hover:text-zinc-100 hover:bg-red-500"
                            onClick={() => setShow(false)}>
                                Cancel
                            </button>
                            {
                                isValidFolderName && folderName &&
                                <button className="w-1/2 px-2 py-1 rounded text-primary font-semibold transition hover:text-zinc-100 hover:bg-primary"
                                onClick={() => createNewFolder()}>
                                    Create
                                </button>
                            }
                        </div>
                    }
                </div>
            </Box>
        </Modal>
    </div>
}