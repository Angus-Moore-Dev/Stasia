import { supabase } from "@/lib/supabaseClient";
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
    setRefreshing:Dispatch<SetStateAction<boolean>>;
    allFileNamesInFolder: string[];
}

export default function NewFileModal({ show, setShow, setRefreshing, currentFolderId, setCurrentFolderId, allFileNamesInFolder }: NewFileModalProps)
{
    const router = useRouter();
    const handleClose = () => setShow(false);
    const [isValidFolderName, setIsValidFolderName] = useState(true);
    const [fileName, setFileName] = useState('');
    const [isCreatingNewFile, setIsCreatingNewFile] = useState(false);
    const [fileNameTaken, setFileNameTaken] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const createNewFile = async () => 
    {
        setIsCreatingNewFile(true);
        const moddedFileName = `${fileName.replaceAll(' ', '_')}.stasia`;
        if (allFileNamesInFolder.some(x => x === moddedFileName))
        {
            setFileNameTaken(true);
            setIsCreatingNewFile(false);
            return;
        }

        const file = new File(["# New Document"], moddedFileName, {
            type: 'text/markdown',
            lastModified: Date.now()
        });

        await supabase.storage.from('general.files').upload(currentFolderId ? `${currentFolderId}/${file.name}` : `${file.name}`, file);
        setIsCreatingNewFile(false);
        setShow(false);
        router.push(`/files/edit?id=${currentFolderId ? `${currentFolderId}/${file.name}` : `${file.name}`}`);
        setRefreshing(true);
    }

    useEffect(() => {
        if (!show)
        {
            setIsValidFolderName(false);
            setFileName('');
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
                        <span>New Document</span>
                    </div>
                    <div className="flex-grow bg-secondary p-8 flex items-center justify-center rounded-b flex-col">
                        <input autoFocus={true} ref={inputRef} value={fileName} onChange={(e) => {
                            setFileNameTaken(false);
                            setIsValidFolderName(true);
                            setFileName(e.target.value);
                        }} pattern="[A-Za-z0-9]" maxLength={48} 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isValidFolderName)
                            {
                                createNewFile();
                            }
                        }}
                        className="px-4 py-1 outline-none bg-tertiary rounded w-full font-semibold aria-disabled:text-red-500"
                        aria-disabled={!isValidFolderName}
                        placeholder="Document Name" />
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
                                onClick={() => createNewFile()}>
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