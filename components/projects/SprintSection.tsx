import { Task, TaskState, TaskType } from "@/models/projects/Task";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Image from 'next/image';
import { supabase } from "@/lib/supabaseClient";
import createToast from "@/functions/createToast";
import TaskModal from "./TaskModal";
import { Profile } from "@/models/me/Profile";
import { User } from "@supabase/supabase-js";

interface SprintSectionProps
{
    user: User;
    tasks: Task[];
}

export default function SprintSection({ user, tasks }: SprintSectionProps)
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

    const reorder = (list: Task[], startIndex: number, endIndex: number) => 
    {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed)
        return result
    }

    return <div className="w-full flex flex-row gap-2">
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
                                <DraggableTicket user={user} key={item.id} task={item} index={index} profile={profiles.find(x => x.id === item.assigneeId)} />
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
                                <DraggableTicket user={user} key={item.id} task={item} index={index} profile={profiles.find(x => x.id === item.assigneeId)} />
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
                                <DraggableTicket user={user} key={item.id} task={item} index={index} profile={profiles.find(x => x.id === item.assigneeId)} />
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
                                <DraggableTicket user={user} key={item.id} task={item} index={index} profile={profiles.find(x => x.id === item.assigneeId)} />
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
}
function DraggableTicket({ user, task, index, profile }: DraggableTicketInterface)
{
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskColour, setTaskColour] = useState('');
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
                className="bg-tertiary p-2 rounded text-zinc-100 transition hover:bg-primary hover:text-secondary w-full h-fit px-4 flex flex-col gap-3 group text-left hover:cursor-pointer" onClick={() => {
                    setShowTaskModal(true);
                }}>
                    <p>Task {task.id}</p>
                    <div className="flex-grow font-medium">
                        {task.name}
                    </div>
                    <div className="flex flex-row items-center justify-start gap-2">
                        <Image src={profile?.profilePictureURL ?? '/blank_pfp.jpg'} alt='task preview' height='20' width='20' className="rounded object-cover w-[20px] h-[20px]" />
                        <span>{profile?.name ?? 'No One Assigned'}</span>
                        <div className="w-32 ml-auto flex justify-center rounded font-semibold group-hover:text-zinc-100 text-zinc-100" style={{ backgroundColor: taskColour }}>
                            {task.taskType}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    </> 
}