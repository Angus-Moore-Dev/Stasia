
import createToast from '@/functions/createToast';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/models/me/Profile';
import { Task, TaskType } from '@/models/projects/Task';
import { Box, Modal } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ContactCommentBox } from '../common/Comment';
import { Comment } from '@/models/chat/Comment';


const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '400px',
    minHeight: '350px',
    maxWidth: '50vw',
    maxHeight: '80vh',
    overflow: 'auto',
    border: '0px solid',
    outline: 'none',
    borderRadius: '4px',
};


interface TaskModalProps
{
    task: Task;
    profile?: Profile;
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
}

export default function TaskModal({ task, profile, show, setShow }: TaskModalProps)
{
    const handleClose = () => setShow(false);
    const [taskTitle, setTaskTitle] = useState(task.name);
    const [taskDescription, setTaskDescription] = useState(task.description);
    const [taskColour, setTaskColour] = useState('');
    const [taskType, setTaskType] = useState(task.taskType);
    const [taskComments, setTaskComments] = useState<Comment[]>();
    
    useEffect(() => {
        // We're doing it this way to containerise the changes inside the modal, but have external changes be reflected here in realtime.
        // That way, we're not passing a setTask object down here and then requiring some nasty callback prop hell.
        setTaskTitle(task.name);
        setTaskDescription(task.description);
        setTaskType(task.taskType);
    }, [task]);

    useEffect(() => 
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
            case TaskType.Other:
                setTaskColour('#525252'); // bg-neutral-600
                break;
        }
    }, [taskType]);

    return <div>
        <Modal
            open={show}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div className='w-[50vw] h-[80vh] bg-tertiary rounded p-8 flex flex-col gap-4'>
                    <div className='w-full flex flex-row items-center'>
                        <input 
                            value={taskTitle} 
                            onChange={(e) => setTaskTitle(e.target.value)} 
                            className='w-full text-3xl font-semibold bg-transparent outline-none focus:border-b-2 border-b-primary'
                            placeholder='Enter Title Here'
                        />
                        <select defaultValue={task.taskType} className={`bg-transparent h-full hover:text-zinc-100 font-semibold text-center rounded-sm w-32`} 
                        style={{ backgroundColor: taskColour }} onChange={async (e) => {
                            const res = await supabase.from('project_tickets').update({
                                taskType: e.target.value
                            }).eq('id', task.id);

                            if (!res.error)
                            {
                                setTaskType(e.target.value as TaskType);
                            }
                            else
                            {
                                createToast(res.error.message, true);
                            }
                        }}>
                            {
                                Object.values(TaskType).map(type => <option key={type} value={type}>{type}</option>)
                            }
                        </select>
                    </div>
                    <textarea className='w-full text-lg bg-transparent rounded p-2 outline-none h-1/4' placeholder='Description Here'>
                        {task.description}
                    </textarea>
                    <p className='py-2 font-medium border-b-[1px] border-b-primary'>Comments</p>
                    <div className='flex-grow h-full flex flex-row'>
                        <div className='w-3/4 h-full flex items-center justify-center'>
                        {
                            (!taskComments  || taskComments?.length === 0) &&
                            <div className='flex-grow flex items-center justify-center'>
                                No Comments
                            </div>
                        }
                        {
                            taskComments && taskComments.map(comment => <ContactCommentBox comment={comment} profile={new Profile()} />)
                        }
                        </div>
                        <div className='w-[280px] h-full border-[1px] rounded border-primary'>

                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
    </div>
}