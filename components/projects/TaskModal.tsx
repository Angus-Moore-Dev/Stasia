
import createToast from '@/functions/createToast';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/models/me/Profile';
import { Task, TaskState, TaskType } from '@/models/projects/Task';
import { Box, Modal } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { ContactCommentBox } from '../common/Comment';
import { Comment } from '@/models/chat/Comment';
import Button from '../common/Button';
import Image from 'next/image';
import LoadingBox from '../LoadingBox';
import { toast } from 'react-toastify';
import { TaskComment } from '@/models/projects/TaskComment';
import createNewNotification from '@/functions/createNewNotification';
import { v4 } from 'uuid';
import { User } from '@supabase/supabase-js';
import { useClickAway } from 'react-use';


const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '400px',
    minHeight: '350px',
    maxWidth: '50vw',
    maxHeight: '75vh',
    overflow: 'auto',
    border: '0px solid',
    outline: 'none',
    borderRadius: '4px',
};


interface TaskModalProps
{
    user: User;
    task: Task;
    profile?: Profile;
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
}

export default function TaskModal({ user, task, profile, show, setShow }: TaskModalProps)
{
    const ref = useRef<HTMLButtonElement>(null);
    useClickAway(ref, () => 
    {
        setShowAllProfiles(false);
    });

    const handleClose = () => setShow(false);
    const [taskTitle, setTaskTitle] = useState(task.name);
    const [taskDescription, setTaskDescription] = useState(task.description);
    const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
    const [taskColour, setTaskColour] = useState('');
    const [taskStateColour, setTaskStateColour] = useState('');
    const [taskType, setTaskType] = useState(task.taskType);
    const [taskComments, setTaskComments] = useState<Comment[]>();
    const [taskState, setTaskState] = useState(task.taskState);
    const [assigneeId, setAssigneeId] = useState(task.assigneeId);
    const titleRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const [showAllProfiles, setShowAllProfiles] = useState(false);
    const [nameQuery, setNameQuery] = useState('');

    const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
    const [creatorOfTask, setCreatorOfTask] = useState<Profile>();
    const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [messageToSendContents, setMessageToSendContents] = useState('');
    
    useEffect(() => {
        // We're doing it this way to containerise the changes inside the modal, but have external changes be reflected here in realtime.
        // That way, we're not passing a setTask object down here and then requiring some nasty callback prop hell.
        console.log('udpating task description::', task.description);
        setTaskTitle(task.name);
        setTaskDescription(task.description);
        setTaskType(task.taskType);
        setAssigneeId(task.assigneeId);
        setTaskState(task.taskState);

        const fetchAllMetadata = async () =>
        {
            setLoadingComments(true);
            setIsFetchingMetadata(true);
            const profileOfCreator = (await supabase.from('profiles').select('name, profilePictureURL').eq('id', task.creatorId).single()).data as Profile;
            profileOfCreator.profilePictureURL = supabase.storage.from('profile.pictures').getPublicUrl(profileOfCreator.profilePictureURL).data.publicUrl!;
            setCreatorOfTask(profileOfCreator);
            const allStaffInvoled = await (await supabase.from('profiles').select('id, name, profilePictureURL')).data as Profile[];
            for (const staff of allStaffInvoled)
            {
                staff.profilePictureURL = supabase.storage.from('profile.pictures').getPublicUrl(staff.profilePictureURL).data.publicUrl!;
            }
            setAllProfiles(allStaffInvoled);
            setIsFetchingMetadata(false);

            const allComments = (await supabase.from('project_ticket_comments').select('*').eq('ticketId', task.id)).data as Comment[];
            setTaskComments(allComments);
            setLoadingComments(false);
        }

        fetchAllMetadata();
    }, [task]);

    useEffect(() => // There has to be a way to automatically configure this.
    {
        switch(taskType)
        {
            case TaskType.General:
                setTaskColour('#15803d'); // bg-green-700
                break;
            case TaskType.CodeTask:
                setTaskColour('#1d4ed8'); // bg-blue-700
                break;
            case TaskType.DesignTask:
                setTaskColour('#b45309'); // bg-amber-700
                break;
            case TaskType.BugFix:
                setTaskColour('#ef4444'); // bg-red-500
                break;
            case TaskType.LogicFix:
                setTaskColour('#b91c1c'); // bg-red-700
                break;
            case TaskType.Research:
                setTaskColour('#84cc16'); // bg-lime-500
                break;
            case TaskType.Investigate:
                setTaskColour('#be123c'); // bg-rose-700
                break;
            case TaskType.Planning:
                setTaskColour('#334155'); // bg-slate-900
                break;
            case TaskType.Other:
                setTaskColour('#525252'); // bg-neutral-600
                break;
        }
    }, [taskType]);


    useEffect(() =>
    {
        switch(taskState)
        {
            case TaskState.NotStarted:
                setTaskStateColour('#1d4ed8'); // bg-neutral-600
                break;
            case TaskState.InProgress:
                setTaskStateColour('#3b82f6'); // bg-blue-700
                break;
            case TaskState.RequiresReview:
                setTaskStateColour('#fbbf24'); // bg-amber-700
                break;
            case TaskState.Completed:
                setTaskStateColour('#00fe49'); // bg-green-600
                break;
        }
    }, [taskState]);



    return <div>
        <Modal
            open={show}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div className='w-[35vw] h-[75vh] bg-tertiary rounded p-8 flex flex-col gap-2'>
                    <div className='w-full flex flex-row items-start gap-4'>
                        <input 
                            ref={titleRef}
                            value={taskTitle}
                            maxLength={255}
                            onChange={(e) => setTaskTitle(e.target.value)} 
                            className='w-full text-xl font-semibold bg-transparent outline-none focus:border-b-2 border-b-primary scrollbar h-full'
                            placeholder='Enter Title Here'
                            contentEditable={true}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter')
                                {
                                    const res = await supabase.from('project_tickets').update({ name: taskTitle }).eq('id', task.id);
                                    if (res.error)
                                    {
                                        createToast(res.error.message, true);
                                    }
                                    else
                                    {
                                        titleRef.current?.blur();
                                    }
                                }
                            }}
                        />
                        <select defaultValue={task.taskType} className={`bg-transparent hover:text-zinc-100 font-semibold text-center rounded-sm w-32 h-fit py-2`} 
                        style={{ backgroundColor: taskColour }} onChange={async (e) => {
                            const res = await supabase.from('project_tickets').update({ taskType: e.target.value }).eq('id', task.id);
                            if (!res.error)
                            {
                                createToast('Successfully Updated Task Title', false);
                                setTaskType(e.target.value as TaskType);
                            }
                            else
                                createToast(res.error.message, true);
                        }}>
                            {
                                Object.values(TaskType).map(type => <option key={type} value={type}>{type}</option>)
                            }
                        </select>
                    </div>
                    <textarea 
                        ref={descriptionRef}
                        value={taskDescription} 
                        onChange={(e) => { setTaskDescription(e.target.value); setShowUnsavedChanges(true); }}
                        className='w-full text-lg rounded p-2 outline-none h-1/2 bg-quaternary mt-2' 
                        placeholder='Description Here'
                    >
                        {task.description}
                    </textarea>
                    {
                        showUnsavedChanges &&
                        <div className='w-full flex items-center justify-end'>
                            <Button text='Update Description' onClick={async () => {
                                const res = await supabase.from('project_tickets').update({
                                    description: taskDescription
                                }).eq('id', task.id);
                                if (res.error)
                                    createToast(res.error.message, true);
                                else
                                {
                                    createToast('Successfully Updated Task Description', false);
                                    descriptionRef.current?.blur();
                                    setShowUnsavedChanges(false);
                                }
                                
                            }} />
                        </div>
                    }
                    <div className='flex-grow h-full flex flex-row'>
                        <div className='w-full h-full p-2 flex flex-col items-start px-4 gap-4'>
                            <span>Task Configuration</span>
                            {
                                isFetchingMetadata && !creatorOfTask &&
                                <div className='flex-grow flex items-center justify-center'>
                                    <LoadingBox />
                                </div>
                            }
                            {
                                !isFetchingMetadata && creatorOfTask &&
                                <>
                                <div className='flex flex-col'>
                                    <small className='text-primary font-semibold'>Created by</small>
                                    <div className='flex flex-row items-center gap-2 px-2 py-1'>
                                        <Image src={creatorOfTask?.profilePictureURL} alt='asfasf' width='40' height='40' className='rounded object-cover w-[40px] h-[40px]' />
                                        <p className='font-medium'>{creatorOfTask.name}</p>
                                    </div>
                                </div>
                                <div className='flex flex-col relative'>
                                    <small className='text-primary font-semibold'>Assigned To</small>
                                    <button ref={ref}
                                    className='flex flex-row items-center gap-2 transition hover:bg-tertiary rounded px-2 py-1 aria-checked:bg-primary aria-checked:text-secondary' onClick={() => {setShowAllProfiles(!showAllProfiles); setNameQuery('')}} 
                                    aria-checked={showAllProfiles}>
                                        <Image src={allProfiles.find(x => x.id === assigneeId)?.profilePictureURL ?? '/blank_pfp.jpg'} alt='asfasf' width='40' height='40' className='rounded object-cover w-[40px] h-[40px]' />
                                        <p className='font-medium'>{allProfiles.find(x => x.id === assigneeId)?.name ?? 'No One (Click to Select)'}</p>
                                    </button>
                                    {
                                        showAllProfiles && 
                                        <div className='absolute z-50 top-16 flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar bg-secondary rounded p-2 w-full'>
                                            <input className='w-full h-14 p-2 bg-tertiary text-zinc-100 border-b-2 border-b-primary rounded' placeholder='Search Name' />
                                            {
                                                allProfiles.map(profile => <button className='flex flex-row items-center gap-2 transition hover:bg-primary hover:text-secondary rounded p-2'
                                                onClick={async () => {
                                                    const res = await supabase.from('project_tickets').update({
                                                        assigneeId: profile.id
                                                    }).eq('id', task.id);
                                                    res.error && createToast(res.error.message, true);
                                                    setShowAllProfiles(false);
                                                    setNameQuery('');
                                                    setAssigneeId(profile.id);
                                                    task.assigneeId = profile.id
                                                }}>
                                                    <Image src={profile.profilePictureURL} alt='asfasf' width='40' height='40' className='rounded object-cover w-[40px] h-[40px]' />
                                                    <p className=''>{profile.name}</p>
                                                </button>
                                                )
                                            }
                                        </div>
                                    }
                                </div>
                                <div className='flex flex-col'>
                                    <small className='text-primary font-semibold'>State</small>
                                    <select defaultValue={taskState} value={taskState} className={`mx-2 bg-transparent h-full text-secondary font-bold text-center rounded-sm w-[90%]`} 
                                    style={{ backgroundColor: taskStateColour }} onChange={async (e) => {
                                        const res = await supabase.from('project_tickets').update({ taskState: e.target.value }).eq('id', task.id);
                                        if (!res.error)
                                            setTaskState(e.target.value as TaskState);
                                        else
                                            createToast(res.error.message, true);
                                    }}>
                                        {
                                            Object.values(TaskState).map(type => <option key={type} value={type}>{type}</option>)
                                        }
                                    </select>
                                </div>
                                <div className='flex flex-col justify-end gap-2'>
                                {
                                    task.onBoard &&
                                    <Button text='Move to Backlog' onClick={async () => {
                                        const res = await supabase.from('project_tickets').update({
                                            onBoard: false,
                                        }).eq('id', task.id);
                                        res.error && createToast(res.error.message, true);
                                        !res.error && createToast('Moved Ticket to Backlog', false);
                                        if (!res.error)
                                            setShow(false);
                                    }} />
                                }
                                {
                                    task.taskState === TaskState.Completed &&
                                    <Button text='Complete Task' onClick={async () => {
                                        const res = await supabase.from('project_tickets').delete().eq('id', task.id);
                                        res.error && createToast(res.error.message, true);
                                        !res.error && createToast('Completed Task', false);
                                        if (!res.error)
                                            setShow(false);
                                    }} />
                                }
                                </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
    </div>
}