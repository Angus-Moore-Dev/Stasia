import { supabase } from "@/lib/supabaseClient";
import { FileData } from "@/models/files/FileMetadata";
import { Box, LinearProgress, Modal, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from 'next/image';
import LoadingBox from "../LoadingBox";
import ShareSharpIcon from '@mui/icons-material/ShareSharp';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '90vw',
    maxHeight: '90vh',
    border: '0px solid',
    outline: 'none'
};

interface FilePreviewModalProps
{
    filePath: string;
    file: FileData;
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    setRefreshing: Dispatch<SetStateAction<boolean>>;
}

export default function FilePreviewModal({ filePath, file, show, setShow, setRefreshing }: FilePreviewModalProps)
{
    const handleClose = () => setShow(false);
    const [imageData, setImageData] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    useEffect(() => {
        if (file && show && !imageData)
        {
            if (sessionStorage.getItem(filePath ? `${filePath}/${file.name}` : `${file.name}`))
            {
                setImageData(sessionStorage.getItem(filePath ? `${filePath}/${file.name}` : `${file.name}`) as string);
            }
            else
            {
                console.log('retrieving file data for::', file.name);
                supabase.storage.from('general.files').download(filePath ? `${filePath}/${file.name}` : `${file.name}`)
                .then(async res => 
                {
                    if (res.data)
                    {
                        const url = URL.createObjectURL(res.data);
                        sessionStorage.setItem(filePath ? `${filePath}/${file.name}` : `${file.name}`, url);
                        setImageData(url);
                    }
                    else
                    {
                        alert(res.error.message);
                    }
                })
            }
        }
    }, [file, show]);
    return <div>
        <Modal
            open={show}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                {
                    !imageData &&
                    <div className="flex items-center justify-center">
                        <LoadingBox />
                    </div>
                }
                {
                    imageData &&
                    <div className="w-full h-full flex flex-col rounded bg-quaternary min-w-[500px]">
                        <div className="py-1 flex flex-row items-center justify-between px-8">
                            <span>{file.name.slice(0, 100)}{file.name.length > 100 && '...'}</span>
                            <div className="flex flex-row gap-2 items-center">
                                {
                                    isDeleting &&
                                    <LinearProgress color="inherit" className="text-red-500 h-2 w-16 rounded" />
                                }
                                {
                                    !isDeleting &&
                                    <button className="px-2 transition font-semibold text-red-500 hover:bg-red-500 hover:text-zinc-100 rounded"
                                    onClick={async () => 
                                    {
                                        setIsDeleting(true);
                                        await supabase.storage.from('general.files').remove([filePath ? `${filePath}/${file.name}` : `${file.name}`]);
                                        setIsDeleting(false);
                                        setShow(false);
                                        setRefreshing(true);
                                    }}>
                                        Flatline
                                    </button>
                                }
                            </div>
                        </div>
                        <div className="flex-grow bg-secondary p-8 hover:cursor-pointer flex items-center justify-center rounded-b">
                            <p>File Preview is Not Available.</p>
                        </div>
                    </div>
                }
            </Box>
        </Modal>
    </div>
}