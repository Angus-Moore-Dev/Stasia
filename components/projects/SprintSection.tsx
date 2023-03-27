import { Task, TaskState, TaskType } from "@/models/projects/Task";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Image from 'next/image';
import { supabase } from "@/lib/supabaseClient";
import createToast from "@/functions/createToast";
import TaskModal from "./TaskModal";
import { Profile } from "@/models/me/Profile";
import { User } from "@supabase/supabase-js";
import PriorityHighSharpIcon from '@mui/icons-material/PriorityHighSharp';
import ReportSharpIcon from '@mui/icons-material/ReportSharp';
import ReportOffSharpIcon from '@mui/icons-material/ReportOffSharp';
import { MajorFeature } from "@/models/projects/MajorFeature";

interface SprintSectionProps
{
    user: User;
    tasks: Task[];
    majorFeatures: MajorFeature[];
}

export default function SprintSection({ user, tasks, majorFeatures }: SprintSectionProps)
{
    // When this updates on onDragEnd, we then check differences and update the ones that are updated.
    // Most of the updated tickets will be from changing their drag position.
    const [taskList, setTaskList] = useState(tasks);
    const [profiles, setProfiles] = useState<Profile[] | null>(null);
    useEffect(() => {
        supabase.from('profiles').select(`id, name, profilePictureURL`).in('id', tasks.filter(x => x.assigneeId !== null).map(x => x.assigneeId)).then(async res => {
            const data = res.data as Profile[];
            if (data)
            {
                for (const profile of data)
                {
                    profile.profilePictureURL = supabase.storage.from('profile.pictures').getPublicUrl(profile.profilePictureURL).data.publicUrl!;
                }
                setProfiles(data);
            }
        });

        setTaskList(tasks);
    }, [tasks]);


    return <div className="w-full flex flex-row gap-2 overflow-y-auto scrollbar">
            {
                taskList.length === 0 &&
                <div className="w-full h-24 flex items-center justify-center">
                    <span>No Tasks In Active Sprint</span>
                </div>
            }
            {
                profiles && taskList && taskList.length > 0 &&
                <DragDropContext
                onDragEnd={async (result) => {
                    const taskTmpList = [...taskList];
                    const draggedTicketId = +result.draggableId;
                    // Check cross column drops.
                    const source = result.source.droppableId;
                    const destinationId = result.destination?.droppableId;
                    if (source !== destinationId)
                    {
                        // We've moved columns and/or rows.
                        taskTmpList[taskTmpList.findIndex(x => x.id === draggedTicketId)].taskState = destinationId as TaskState;
                        const res = await supabase.from('project_tickets').update({ taskState: destinationId, onBoard: true })
                        .eq('id', taskTmpList[taskTmpList.findIndex(x => x.id === draggedTicketId)].id);
                        res.error && createToast(res.error.message, true);
                    }
                }}>
                    <Droppable droppableId="Not Started">
                    {(provided, snapshot) => (
                        <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-col gap-1 w-1/4 bg-quaternary p-2 rounded"
                        >
                            <span className="w-full border-b-primary border-b-2">Not Started</span>
                            {taskList.filter(x => x.taskState === TaskState.NotStarted).map((item, index) => (
                                <DraggableTicket 
                                    user={user} 
                                    key={item.id} 
                                    task={item} 
                                    index={index} 
                                    profile={profiles.find(x => x.id === item.assigneeId)} 
                                    majorFeature={majorFeatures.find(x1 => x1.id === item.majorFeatureId)} 
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                    </Droppable>
                    <Droppable droppableId="In Progress">
                    {(provided, snapshot) => (
                        <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-col gap-1 w-1/4 bg-quaternary p-2 rounded"
                        >
                            <span className="w-full border-b-primary border-b-2">In Progress</span>
                            {taskList.filter(x => x.taskState === TaskState.InProgress).map((item, index) => (
                                <DraggableTicket 
                                    user={user} 
                                    key={item.id} 
                                    task={item} 
                                    index={index} 
                                    profile={profiles.find(x => x.id === item.assigneeId)} 
                                    majorFeature={majorFeatures.find(x1 => x1.id === item.majorFeatureId)} 
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                    </Droppable>
                    <Droppable droppableId="Requires Review">
                    {(provided, snapshot) => (
                        <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-col gap-1 w-1/4 bg-quaternary p-2 rounded"
                        >
                            <span className="w-full border-b-primary border-b-2">Requires Review</span>
                            {taskList.filter(x => x.taskState === TaskState.RequiresReview).map((item, index) => (
                                <DraggableTicket 
                                    user={user} 
                                    key={item.id} 
                                    task={item} 
                                    index={index} 
                                    profile={profiles.find(x => x.id === item.assigneeId)} 
                                    majorFeature={majorFeatures.find(x1 => x1.id === item.majorFeatureId)} 
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                    </Droppable>
                    <Droppable droppableId="Completed">
                    {(provided, snapshot) => (
                        <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-col gap-1 w-1/4 bg-quaternary p-2 rounded"
                        >
                            <span className="w-full border-b-primary border-b-2">Completed</span>
                            {taskList.filter(x => x.taskState === TaskState.Completed).map((item, index) => (
                                <DraggableTicket 
                                    user={user} 
                                    key={item.id} 
                                    task={item} 
                                    index={index} 
                                    profile={profiles.find(x => x.id === item.assigneeId)} 
                                    majorFeature={majorFeatures.find(x1 => x1.id === item.majorFeatureId)} 
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                    </Droppable>
                </DragDropContext>
            }
        </div>
}


interface DraggableTicketInterface
{
    user: User;
    task: Task;
    index: number;
    profile: Profile | undefined;
    majorFeature: MajorFeature | undefined;
}
function DraggableTicket({ user, task, index, profile, majorFeature }: DraggableTicketInterface)
{
    const [showImportantButton, setShowImportantButton] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskColour, setTaskColour] = useState('');

    const [majorFeatureName, setMajorFeatureName] = useState('');

    useEffect(() => 
    {
        switch(task.taskType)
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
    }, [task.taskType]);

    return <>
        <TaskModal user={user} task={task} profile={profile} show={showTaskModal} setShow={setShowTaskModal} />
        <Draggable key={task.id} draggableId={`${task.id}`} index={index}>
            {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                onMouseOver={() => setShowImportantButton(true)}
                onMouseLeave={() => setShowImportantButton(false)}
                className="group bg-tertiary p-2 rounded text-zinc-100 transition hover:bg-primary hover:text-secondary w-full h-fit px-4 flex flex-col group text-left hover:cursor-pointer
                aria-checked:border-red-500 aria-checked:border-b-4 aria-checked:hover:bg-red-500 aria-checked:hover:text-zinc-100"
                aria-checked={task.important}>
                    <div className="w-full flex flex-row items-center justify-start gap-4 pb-3">
                        <p className="" onClick={() => setShowTaskModal(true)}>Task {task.id}</p>
                        <div className="w-32 flex justify-center rounded font-semibold group-hover:text-zinc-100 text-zinc-100" style={{ backgroundColor: taskColour }}>
                            {task.taskType}
                        </div>
                        {
                            showImportantButton &&
                            <button className="ml-auto rounded text-red-500 transition hover:bg-red-500 hover:text-zinc-100 flex items-center justify-center py-[1px] px-1
                            aria-checked:text-zinc-100 aria-checked:hover:text-red-500 aria-checked:hover:bg-zinc-100" 
                            aria-checked={task.important}
                            onClick={async () => {
                                const res = await supabase.from('project_tickets').update({ important: !task.important }).eq('id', task.id);
                                res.error && createToast(res.error.message, true);
                            }}>
                                { !task.important && <ReportSharpIcon fontSize="small" /> }
                                { task.important && <ReportOffSharpIcon fontSize="small" /> }
                            </button>
                        }
                    </div>
                    <div className="flex-grow pb-3 text-base" onClick={() => setShowTaskModal(true)}>
                        {task.name}
                    </div>
                    <div className="flex flex-row items-center justify-start gap-2 pb-3" onClick={() => setShowTaskModal(true)}>
                        <Image src={profile?.profilePictureURL ?? '/blank_pfp.jpg'} alt='task preview' height='20' width='20' className="rounded object-cover w-[20px] h-[20px]" />
                        <span>{profile?.name ?? 'No One Assigned'}</span>
                        {
                            majorFeature &&
                            <div className="py-[2px] text-center bg-primary text-secondary font-bold rounded px-1">
                                { majorFeature.name.length >= 22 ? `${majorFeature.name.slice(0, 22)}...` : majorFeature.name }
                            </div>
                        }
                    </div>
                </div>
            )}
        </Draggable>
    </> 
}