
import createToast from '@/functions/createToast';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/models/me/Profile';
import { Task, TaskType } from '@/models/projects/Task';
import { Box, Modal } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { ContactCommentBox } from '../common/Comment';
import { Comment } from '@/models/chat/Comment';
import Button from '../common/Button';


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

    return <div>
        <Modal
            open={show}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div className='w-[50vw] h-[80vh] bg-tertiary rounded p-8 flex flex-col gap-2'>
                    <div className='w-full flex flex-row items-start gap-4'>
                        <input 
                            value={taskTitle}
                            maxLength={255}
                            onChange={(e) => setTaskTitle(e.target.value)} 
                            className='w-full text-xl font-semibold bg-transparent outline-none focus:border-b-2 border-b-primary scrollbar h-full'
                            placeholder='Enter Title Here'
                            contentEditable={true}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter')
                                {

                                }
                            }}
                        />
                        <select defaultValue={task.taskType} className={`bg-transparent hover:text-zinc-100 font-semibold text-center rounded-sm w-32 h-fit py-2`} 
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
                    <p className='py-2 font-medium border-b-2 border-b-primary'>Comments</p>
                    <div className='flex-grow h-full flex flex-row'>
                        <div className='flex-grow h-full flex items-center justify-center'>
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
                        <div className='w-[280px] h-full border-l-2 border-primary p-2'>
                            Configuration goes here.
                        </div>
                    </div>
                    <Button text={`${task.completed ? 'Mark Task as Not Complete' : 'Complete Task'}`} className='ml-auto bg-transparent' onClick={async () => {
                        const res= await supabase.from('project_tickets').update({
                            completed: !task.completed,
                        }).eq('id', task.id);
                        createToast(res.error ? res.error.message : `${task.completed ? 'Task Marked As Not Complete' : 'Task Has Been Completed'}`, res.error !== null);
                    }} />
                </div>
            </Box>
        </Modal>
    </div>
}