import { supabase } from "@/lib/supabaseClient";
import { FileData } from "@/models/files/FileMetadata";
import { Box, LinearProgress, Modal } from "@mui/material";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import LoadingBox from "../LoadingBox";
import { CopyToClipboard } from 'react-copy-to-clipboard';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '75vw',
    border: '0px solid',
    outline: 'none'
};

interface ShareFileModalProps
{
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    currentFolderId: string;
    file: FileData;
}

export default function ShareFileModal({ show, setShow, currentFolderId, file }: ShareFileModalProps)
{
    const router = useRouter();
    const handleClose = () => setShow(false);
    const [signedURL, setSignedURL] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCopyText, setShowCopyText] = useState(false);

    const createNewSignedURL = async () =>
    {
        const url = (await supabase.storage.from('general.files').createSignedUrl(currentFolderId ? `${currentFolderId}/${file.name}` : file.name, 86400)).data?.signedUrl;
        setSignedURL(url ?? 'Error. Your Role May Not Allow Sharing Files.');
    }

    useEffect(() => {
        if (!show)
        {
            setSignedURL('');
            setIsLoading(true);
            setShowCopyText(false);
        }
        else
        {
            createNewSignedURL();
        }
    }, [show]);

    useEffect(() => {
        if (signedURL)
        {
            setIsLoading(false);
        }
    }, [signedURL]);

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
                        <span>Share File</span>
                    </div>
                    <div className="flex-grow bg-secondary p-4 flex items-center justify-center rounded-b flex-col">
                        {
                            isLoading &&
                            <div className="flex-grow flex items-center justify-center">
                                <LoadingBox />
                            </div>
                        }
                        {
                            !isLoading &&
                            <>
                            <span className="w-full mb-2">Click to Copy URL</span>
                            <CopyToClipboard text={signedURL}>
                                <div className="p-2 w-full rounded transition bg-tertiary hover:bg-primary hover:bg-text-secondary font-semibold hover:cursor-pointer"
                                onClick={() => setShowCopyText(true)}>
                                {
                                    signedURL.slice(0, 128)
                                }
                                </div>
                            </CopyToClipboard>
                            {
                                showCopyText &&
                                <small className="w-full pt-2 font-medium">Copied to Clipboard.</small>
                            }
                            </>
                        }
                    </div>
                </div>
            </Box>
        </Modal>
    </div>
}