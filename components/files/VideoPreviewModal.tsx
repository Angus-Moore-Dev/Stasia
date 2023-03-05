import { supabase } from "@/lib/supabaseClient";
import { FileData } from "@/models/files/FileMetadata";
import { Box, Modal, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from 'next/image';
import LoadingBox from "../LoadingBox";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '75vw',
    border: '0px solid',
    outline: 'none'
};

interface ImagePreviewModalProps
{
    filePath: string;
    file: FileData;
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
}

export default function VideoPreviewModal({ filePath, file, show, setShow }: ImagePreviewModalProps)
{
    const handleClose = () => setShow(false);
    const [imageData, setImageData] = useState('');
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
                .then(async res => {
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
                            <div className="flex flex-row gap-8">
                                <button className="px-2 transition font-semibold text-primary hover:bg-primary hover:text-secondary rounded">Share</button>
                                <button className="px-2 transition font-semibold text-red-500 hover:bg-red-500 hover:text-zinc-100 rounded">Delete</button>
                            </div>
                        </div>
                        <video controls>
                            <source src={imageData} />
                        </video>
                    </div>
                }
            </Box>
        </Modal>
    </div>
}