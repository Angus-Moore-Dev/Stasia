import { FileData } from '@/models/files/FileMetadata';
import ArticleSharpIcon from '@mui/icons-material/ArticleSharp';
import ImageSharpIcon from '@mui/icons-material/ImageSharp';
import MovieSharpIcon from '@mui/icons-material/MovieSharp';
import FolderSharpIcon from '@mui/icons-material/FolderSharp';
import { Dispatch, SetStateAction, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 } from 'uuid';
import EditSharpIcon from '@mui/icons-material/EditSharp';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';
import ImagePreviewModal from './ImagePreviewModal';
import VideoPreviewModal from './VideoPreviewModal';
import InsertDriveFileSharpIcon from '@mui/icons-material/InsertDriveFileSharp';
import { LinearProgress } from '@mui/material';

interface FileProps
{
    file: FileData;
    currentFolderId: string; // So we can track where we are in the file list.
    setFolderListId: Dispatch<SetStateAction<string>>;
    activeContextMenu: string;
    setActiveContextMenu: Dispatch<SetStateAction<string>>;
    setRefreshing: Dispatch<SetStateAction<boolean>>;
}

export default function File({ file, currentFolderId, setFolderListId, activeContextMenu, setActiveContextMenu, setRefreshing }: FileProps)
{
    const [divId] = useState(v4()); // This is because folders do not have ids, so we must create our own.
    const [isFolder] = useState(!file.metadata || file.metadata === null);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [mousePositionOnScreen, setMousePositionOnScreen] = useState<{x: number, y: number}>({x: 0, y: 0});

    const [imageModal, setImageModal] = useState(false);
    const [videoModal, setVideoModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const readableFileType = isFolder ? 'Folder' : file.metadata?.mimetype.includes('video') ? 'Video' : file.metadata?.mimetype.includes('image') ? 'Image' : 'File';

    return <>
        <ImagePreviewModal show={imageModal} setShow={setImageModal} file={file} filePath={currentFolderId} setRefreshing={setRefreshing} />
        <VideoPreviewModal show={videoModal} setShow={setVideoModal} file={file} filePath={currentFolderId} setRefreshing={setRefreshing} />
        <div className={`relative z-40 select-none w-full px-8 py-4 flex flex-row gap-8 flex-wrap items-center transition hover:bg-quaternary hover:text-primary font-medium hover:cursor-pointer ${!file.metadata && 'font-semibold'}`}
        onContextMenuCapture={(e) => e.preventDefault()}
        onDoubleClick={async () => {
            if (isFolder)
            {
                // Because we're going into a sub-folder, the string formatting is applied in that scenario.
                // for instance, '' becomes /Test_Files.
                // If clicking a folder within that, it becomes /Test_Files/Subtest_Files/..., son and so forth. 
                // There are other mechanisms in place for upwards in the list.
                setFolderListId(currentFolderId ? `${currentFolderId}/${file.name}` : file.name);
            }
            else
            {
                if (file.metadata.mimetype.includes('image/'))
                    setImageModal(true);
                else if (file.metadata.mimetype.includes('video/'))
                    setVideoModal(true);
            }
        }}
        onMouseDown={(e) => {
            if (e.button === 2)
            {
                e.preventDefault();
                setMousePositionOnScreen({x: e.clientX, y: e.clientY});
                setShowContextMenu(true);
                setActiveContextMenu(divId);
                console.log(e.clientX, e.clientY);
            }
        }}
        >
            {
                readableFileType === 'Folder' &&
                <FolderSharpIcon fontSize='medium' />
            }
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
            <div className='flex-grow flex flex-row justify-start gap-4'>
                <p className='w-3/5'>{file.name.replaceAll('_', ' ').slice(0, 48)}{file.name.length >= 48 ? '...' : ''}</p>
                {
                    file.metadata &&
                    <div className='flex-grow flex flex-row justify-between'>
                    <p>{new Date(file.metadata.lastModified).toLocaleString('en-au', {timeStyle: 'short', dateStyle: 'short', hour12: false})}</p>
                    <p className=''>{file.metadata?.size > 1000 ? file.metadata.size > 1000000 ? `${Math.round((file.metadata?.size / 1000000) * 100) / 100} MB` : `${Math.round((file.metadata?.size / 1000) * 100) / 100} KB` : `${file.metadata?.size} bytes`}</p>
                    </div>
                }
            </div>
        </div>
        {/* This is the popup box that appears on a given file */}
        <div hidden={!showContextMenu || activeContextMenu !== divId} className='w-64 h-96 absolute bg-quaternary z-40 rounded'
        style={{
            top: mousePositionOnScreen.y + 2,
            left: mousePositionOnScreen.x
        }}
        onContextMenuCapture={(e) => e.preventDefault()}>
            <div className='p-2 bg-primary w-full font-semibold text-secondary mb-1 rounded-t'>
                Select an Action
            </div>
            <div className='w-full flex flex-col'>
                <button className='w-full p-2 text-primary font-semibold transition hover:bg-primary hover:text-secondary text-left px-4
                mb-2 border-b-[1px] border-b-primary'>
                    <VisibilitySharpIcon fontSize='small' />
                    <span className='pl-4'>Open {readableFileType}</span>
                </button>
                <button className='w-full p-2 text-primary font-semibold transition hover:bg-primary hover:text-secondary text-left px-4'>
                    <EditSharpIcon fontSize='small' />
                    <span className='pl-4'>Rename {readableFileType}</span>
                </button>
                <button className='w-full p-2 text-primary font-semibold transition hover:bg-primary hover:text-secondary text-left px-4'>
                    <AccountTreeIcon fontSize='small' />
                    <span className='pl-4'>Share {readableFileType} With Others</span>
                </button>
                {
                    !isFolder &&
                    <>
                    {
                    isDeleting &&
                    <LinearProgress color="inherit" className="flex-grow h-3 rounded-sm text-red-500 mx-4 my-2" />
                    }
                    {
                        !isDeleting &&
                        <button className='w-full p-2 text-red-500 font-semibold transition hover:bg-red-500 hover:text-zinc-100 text-left px-4'
                        onClick={async () => {
                            setIsDeleting(true);
                            console.log(currentFolderId ? `${currentFolderId}/${file.name}` : file.name);
                            const res = await supabase.storage.from('general.files').remove([currentFolderId ? `${currentFolderId}/${file.name}` : file.name]);
                            console.log(res);
                            setIsDeleting(false);
                            setRefreshing(true);
                        }}>
                            <DeleteSharpIcon fontSize='small' />
                            <span className='pl-4'>Delete {readableFileType}</span>
                        </button>
                    }
                    </>
                }
            </div>
        </div>
    </>
}