import { supabase } from "@/lib/supabaseClient";
import { FileData } from "@/models/files/FileMetadata";
import { Box, LinearProgress, Modal, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import Image from 'next/image';
import LoadingBox from "../LoadingBox";
import { useDropzone } from "react-dropzone";
import InsertDriveFileSharpIcon from '@mui/icons-material/InsertDriveFileSharp';
import ImageSharpIcon from '@mui/icons-material/ImageSharp';
import MovieSharpIcon from '@mui/icons-material/MovieSharp';
import { v4 } from "uuid";
import Button from "../common/Button";
import { toast } from "react-toastify";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '75vw',
    maxHeight: 'vh',
    overflow: 'auto',
    border: '0px solid',
    outline: 'none'
};

interface ImagePreviewModalProps
{
    filePath: string; // We need this for the route we're going to upload these files to.
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    setComplete: Dispatch<SetStateAction<boolean>>; // Used to tell the parent div that we're complete and to refresh.
}

export default function FileUploadModal({ filePath, show, setShow, setComplete }: ImagePreviewModalProps)
{
    const [files, setFiles] = useState<File[]>();
    const handleClose = () => setShow(false);
    const onDrop = useCallback((acceptedFiles: File[]) => setFiles(acceptedFiles), []);
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});
    const [fileUploadingId, setFileUploadingId] = useState('');
    const [successfulFileUploads, setSuccessfulFileUploads] = useState<string[]>([]);
    const [failedFileUploads, setFailedFileUploads] = useState<string[]>([]);

    useEffect(() => {
        if (!show || files?.length === 0)
        {
            setFileUploadingId('');
            setSuccessfulFileUploads([]);
            setFailedFileUploads([]);
            setFiles(undefined);
        }
    }, [show, files]);


    const uploadAllFiles = async () =>
    {
        for (const file of files ?? [])
        {
            setFileUploadingId(file.name);
            const res = await supabase.storage.from('general.files').upload(filePath ? `${filePath}/${file.name}` : `${file.name}`, file);
            if (res.error)
            {
                toast.error(res.error?.message, 
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
                setFailedFileUploads(failedUploads => [...failedUploads, file.name]);
            }
            else
            {
                setSuccessfulFileUploads(successfulUploads => [...successfulUploads, file.name]);
            }
        }
        setComplete(true);
        setFileUploadingId('');
        setShow(false);
    }

    return <div>
        <Modal
            open={show}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div className="bg-quaternary w-[60vw] max-w-[1200px] rounded flex flex-col min-h-[384px] max-h-[75vh]">
                    <div className="w-full flex flex-row items-center justify-between px-8">
                        <span className="">Upload New Files</span>
                        {
                            files && !fileUploadingId &&
                            <Button text='Upload' onClick={() => uploadAllFiles()} className="bg-transparent px-2 py-0" />
                        }
                    </div>
                    {
                        !files &&
                        <div {...getRootProps()} className="flex-grow bg-secondary p-8 hover:cursor-pointer flex items-center justify-center transition hover:bg-primary hover:text-secondary rounded-b">
                            <input {...getInputProps()} />
                            <p className="font-medium">
                                <b>Drag</b> Files to Upload, or <b>Click</b> to Select
                            </p>
                        </div>
                    }
                    {
                        files &&
                        <div className="flex-grow bg-secondary px-8 py-4 rounded-b flex flex-col gap-1 overflow-y-auto scrollbar">
                            {
                                files.sort((a, b) => a.size - b.size).map(file => {
                                    const readableFileType = file.type.includes('video') ? 'Video' : file.type.includes('image') ? 'Image' : 'File';
                                    return <div className="w-full flex flex-row gap-2 items-center">
                                        {
                                            readableFileType === 'Image' &&
                                            <ImageSharpIcon fontSize='medium' />
                                        }
                                        {
                                            readableFileType === 'Video' &&
                                            <MovieSharpIcon fontSize='medium' />
                                        }
                                        {
                                            readableFileType === 'File' &&
                                            <InsertDriveFileSharpIcon fontSize='medium' />
                                        }
                                        <span className="w-80">{file.name.slice(0, 40)}{file.name.length > 40 && '...'}</span>
                                        <span className="text-right w-24">{file.size > 1000 ? file.size > 1000000 ? `${Math.round((file.size / 1000000) * 100) / 100} MB` : `${Math.round((file.size / 1000) * 100) / 100} KB` : `${file.size} bytes`}</span>
                                        {
                                            !fileUploadingId && successfulFileUploads.length === 0 &&
                                            <div className="flex-grow flex items-center justify-end">
                                                <button className="text-red-500 font-semibold transition hover:text-zinc-100 hover:bg-red-500 px-2 py rounded"
                                                onClick={() => {setFiles(files.filter(x => x !== file))}}>Clear</button>
                                            </div>
                                        }
                                        {
                                            successfulFileUploads.find(x => x === file.name) &&
                                            <LinearProgress color="inherit" className="flex-grow h-3 rounded text-primary" value={100} variant="determinate" />
                                        }
                                        {
                                            failedFileUploads.find(x => x === file.name) &&
                                            <>
                                            <span className="font-semibold text-red-500">Error in uploading file.</span>
                                            <LinearProgress color="inherit" className="flex-grow h-3 rounded text-red-500" value={100} variant="determinate" />
                                            </>
                                        }
                                        {
                                            fileUploadingId === file.name &&
                                            <LinearProgress color="inherit" className="flex-grow h-3 rounded text-primary" />
                                        }
                                    </div>
                                })
                            }
                        </div>
                    }
                </div>
            </Box>
        </Modal>
    </div>
}