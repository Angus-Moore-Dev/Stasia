import { FileData } from '@/models/files/FileMetadata';
import ArticleSharpIcon from '@mui/icons-material/ArticleSharp';
import ImageSharpIcon from '@mui/icons-material/ImageSharp';
import MovieSharpIcon from '@mui/icons-material/MovieSharp';
import FolderSharpIcon from '@mui/icons-material/FolderSharp';
import { Dispatch, SetStateAction, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 } from 'uuid';
import CreateNewFolderSharpIcon from '@mui/icons-material/CreateNewFolderSharp';
import EditSharpIcon from '@mui/icons-material/EditSharp';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';

interface FileProps
{
    file: FileData;
    setFolderListId: Dispatch<SetStateAction<string>>;
    activeContextMenu: string;
    setActiveContextMenu: Dispatch<SetStateAction<string>>;
}

export default function File({ file, setFolderListId, activeContextMenu, setActiveContextMenu }: FileProps)
{
    const [divId] = useState(v4()); // This is because folders do not have ids, so we must create our own.
    const [isFolder, setIsFolder] = useState(!file.metadata);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [mousePositionOnScreen, setMousePositionOnScreen] = useState<{x: number, y: number}>({x: 0, y: 0});
    const readableFileType = isFolder ? 'Folder' : file.metadata.mimetype.includes('video') ? 'Video' : file.metadata.mimetype.includes('image') ? 'Image' : 'File';
    return <>
        <div className={`relative w-full px-8 py-4 flex flex-row gap-4 flex-wrap items-center transition hover:bg-[#0e0e0e] hover:text-primary font-medium hover:cursor-pointer ${!file.metadata && 'font-semibold'}`}
        onContextMenuCapture={(e) => e.preventDefault()}
        onDoubleClick={async () => {
            if (isFolder)
            {
                setFolderListId(file.name);
                console.log(file);
                const { data, error } = await supabase.storage.from(`general.files`).list('Test_Files/test_subfolder');
                console.log('subfolder data::', data);
                // console.log(data);
            }
            else
            {
                // Trigger image preview.
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
                !file.metadata && 
                <FolderSharpIcon fontSize='medium' />
            }
            {
                file.metadata && file.metadata?.mimetype.includes("image/") &&
                <ImageSharpIcon fontSize='medium' />
            }
            {
                file.metadata && file.metadata?.mimetype.includes("video/") &&
                <MovieSharpIcon fontSize='medium' />
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
                <button className='w-full p-2 text-primary font-semibold transition hover:bg-primary hover:text-secondary text-left px-4'>
                    <EditSharpIcon fontSize='small' />
                    <span className='pl-4'>Rename {readableFileType}</span>
                </button>
                <button className='w-full p-2 text-primary font-semibold transition hover:bg-primary hover:text-secondary text-left px-4'>
                    <AccountTreeIcon fontSize='small' />
                    <span className='pl-4'>Share {readableFileType} With Others</span>
                </button>
                <button className='w-full p-2 text-primary font-semibold transition hover:bg-primary hover:text-secondary text-left px-4'>
                    <DeleteSharpIcon fontSize='small' />
                    <span className='pl-4'>Delete {readableFileType}</span>
                </button>
            </div>
        </div>
    </>
}