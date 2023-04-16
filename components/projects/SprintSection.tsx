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
import { TaskCategory } from "@/models/projects/TaskCategory";



// This is for handling vertical re-ordering of the draggables.


interface SprintSectionProps
{
    user: User;
    tasks: Task[];
    majorFeatures: MajorFeature[];
    categories: TaskCategory[];
}

export default function SprintSection({ user, tasks, majorFeatures, categories }: SprintSectionProps)
{
    // When this updates on onDragEnd, we then check differences and update the ones that are updated.
    // Most of the updated tickets will be from changing their drag position.
    const [taskList, setTaskList] = useState(tasks);
    const [profiles, setProfiles] = useState<Profile[] | null>(null);
    useEffect(() => {
        // if the list of profiles does not contain all assignees, we need to fetch them.
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
    }, [tasks, profiles]);


    useEffect(() => {
        // Update after we've rerendered those changes, so it's optimistically updated.
        // for (const task of taskList)
        // {
        //     if (task.taskState !== tasks.find(x => x.id === task.id)?.taskState || task.position !== tasks.find(x => x.id === task.id)?.position)
        //     {
        //         // If the task's state has updated or its position has moved, we need to save that.
        //         supabase.from('tasks').update({ taskState: task.taskState, position: task.position }).eq('id', task.id).then(res => {
        //             res.error && createToast(res.error.message, true);
        //         });
            
        //     }
        // }
    }, [taskList]);


    return <div className="w-full flex-grow flex flex-col lg:flex-row gap-2 scrollbar">
            {
                taskList.length === 0 &&
                <div className="w-full mt-8 flex items-center justify-center">
                    <span className="font-semibold">
                        No Tasks In Active Sprint
                    </span>
                </div>
            }
            {
                profiles && taskList && taskList.length > 0 &&
                <DragDropContext
                onDragUpdate={(result) => {
                }}
                onDragEnd={async (result) => {
                    // This fires after the last update occurs.
                    console.log('ended firing::');
                    if (!result.destination) return;
                    // This fires on every single event.
                    console.log('result::', result.source.index, result.destination.index);

                    if (result.source.droppableId === result.destination.droppableId) // Moving in the same column
                    {
                        const taskState = result.source.droppableId as TaskState;
                        const newTaskList = [...taskList.filter(x => x.taskState === taskState)];
                        const [removed] = newTaskList.splice(result.source.index, 1);
                        newTaskList.splice(result.destination.index, 0, removed);
                        for (let i = 0; i < newTaskList.length; i++)
                        {
                            newTaskList[i].position = i;
                        }

                        // merge the temp array's items with the original
                        const updatedTaskList = [...taskList.filter(x => x.taskState !== taskState), ...newTaskList];
                        for (const task of updatedTaskList)
                        {
                            const res = await supabase.from('project_tickets').update({ taskState: task.taskState, position: task.position }).eq('id', task.id);
                            res.error && createToast(res.error.message, true);
                        }
                        setTaskList(updatedTaskList);
                    }
                    else
                    {
                        // Firstly we have to update the task's state, since it has moved columns
                        const list = [...taskList];
                        const newTaskState = result.destination.droppableId as TaskState;
                        // List in place update of the task state 
                        list[list.findIndex(x => x.id === +result.draggableId)].taskState = newTaskState;
                        const allTasksWithNewState = list.filter(x => x.taskState === newTaskState);

                        if (allTasksWithNewState.length === 0)
                        {
                            // If there are no tasks in the new column, then just set the position to 0.
                            list[list.findIndex(x => x.id === +result.draggableId)].position = 0;
                        }
                        else
                        {
                            if (allTasksWithNewState.find(x => x.position === result.destination?.index))
                            {
                                // If there are tasks that's position is equal to or greater, move them down by 1.
                                for (const task of allTasksWithNewState)
                                {
                                    if (task.position >= result.destination?.index)
                                    {
                                        task.position++;
                                    }
                                }

                                // Set the position of the task to the destination index.
                                list[list.findIndex(x => x.id === +result.draggableId)].position = result.destination.index;
                            }
                            else
                            {
                                // If there's no task in the same position, then just set the position to the destination index.
                                list[list.findIndex(x => x.id === +result.draggableId)].position = result.destination.index;
                            }

                            // Go through the old task state list and update their positions.
                            const allTasksFromOldState = list.filter(x => x.taskState === result.source.droppableId as TaskState);
                            for (let i = 0; i < allTasksFromOldState.length; i++)
                            {
                                allTasksFromOldState[i].position = i;
                            }
                        }

                        // merge the temp array's items with the original
                        const updatedTaskList = [...list.filter(x => x.taskState !== newTaskState), ...allTasksWithNewState];
                        for (const task of updatedTaskList)
                        {
                            const res = await supabase.from('project_tickets').update({ taskState: task.taskState, position: task.position }).eq('id', task.id);
                            res.error && createToast(res.error.message, true);
                        }
                        // Update 

                        setTaskList(updatedTaskList);

                        // TODO: Update the task based on the result's index, shuffling everything in between.
                        // If a task exists in the same spot, move it down a slot.

                        // Take the result index, check if there's a spot in the slot.
                        // If there's nothing there, then just set the index.
                    }
                }}>
                    <Droppable droppableId="Not Started">
                    {(provided, snapshot) => (
                        <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-col gap-1 w-full lg:w-1/4 bg-quaternary p-2 rounded"
                        >
                            <span className="w-full border-b-primary border-b-2 font-semibold">Not Started</span>
                            {taskList.filter(x => x.taskState === TaskState.NotStarted).sort((a, b) => a.position - b.position).map((item, index) => (
                                <DraggableTicket 
                                    user={user} 
                                    key={item.id} 
                                    task={item} 
                                    index={index} 
                                    profile={profiles.find(x => x.id === item.assigneeId)} 
                                    majorFeature={majorFeatures.find(x1 => x1.id === item.majorFeatureId)} 
                                    categories={categories}
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
                        className="flex flex-col gap-1 w-full lg:w-1/4 bg-quaternary p-2 rounded"
                        >
                            <span className="w-full border-b-primary border-b-2 font-semibold">In Progress</span>
                            {taskList.filter(x => x.taskState === TaskState.InProgress).sort((a, b) => a.position - b.position).map((item, index) => (
                                <DraggableTicket 
                                    user={user} 
                                    key={item.id} 
                                    task={item} 
                                    index={index} 
                                    profile={profiles.find(x => x.id === item.assigneeId)} 
                                    majorFeature={majorFeatures.find(x1 => x1.id === item.majorFeatureId)} 
                                    categories={categories}
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
                        className="flex flex-col gap-1 w-full lg:w-1/4 bg-quaternary p-2 rounded"
                        >
                            <span className="w-full border-b-primary border-b-2 font-semibold">Requires Review (Testing)</span>
                            {taskList.filter(x => x.taskState === TaskState.RequiresReview).sort((a, b) => a.position - b.position).map((item, index) => (
                                <DraggableTicket 
                                    user={user} 
                                    key={item.id} 
                                    task={item} 
                                    index={index} 
                                    profile={profiles.find(x => x.id === item.assigneeId)} 
                                    majorFeature={majorFeatures.find(x1 => x1.id === item.majorFeatureId)}
                                    categories={categories}
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
                        className="flex flex-col gap-1 w-full lg:w-1/4 bg-quaternary p-2 rounded"
                        >
                            <span className="w-full border-b-primary border-b-2 font-semibold">Completed</span>
                            {taskList.filter(x => x.taskState === TaskState.Completed).sort((a, b) => a.position - b.position).map((item, index) => (
                                <DraggableTicket 
                                    user={user} 
                                    key={item.id} 
                                    task={item} 
                                    index={index} 
                                    profile={profiles.find(x => x.id === item.assigneeId)} 
                                    majorFeature={majorFeatures.find(x1 => x1.id === item.majorFeatureId)} 
                                    categories={categories}
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
    categories: TaskCategory[];
}
function DraggableTicket({ user, task, index, profile, majorFeature, categories }: DraggableTicketInterface)
{
    const [showImportantButton, setShowImportantButton] = useState(false);
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
        <TaskModal user={user} task={task} profile={profile} show={showTaskModal} setShow={setShowTaskModal} categories={categories} />
        <Draggable key={task.id} draggableId={`${task.id}`} index={index}>
            {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                onMouseOver={() => setShowImportantButton(true)}
                onMouseLeave={() => setShowImportantButton(false)}
                className="group bg-tertiary p-2 rounded text-zinc-100 transition hover:bg-primary hover:text-secondary w-full h-fit px-4 flex flex-col group text-left hover:cursor-pointer
                aria-checked:border-red-500 aria-checked:border-b-4 aria-checked:hover:bg-red-500 aria-checked:hover:text-zinc-100 overflow-x-auto scrollbar"
                aria-checked={task.important}>
                    <div className="w-full flex flex-row items-center justify-start gap-4 pb-3">
                        <p className="" onDoubleClick={() => setShowTaskModal(true)}>Task {task.id}</p>
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
                    <div className="flex-grow pb-3 text-base" onDoubleClick={() => setShowTaskModal(true)}>
                        {task.name}
                    </div>
                    <div className="flex flex-row items-center justify-start gap-2 pb-3" onDoubleClick={() => setShowTaskModal(true)}>
                        <Image src={profile?.profilePictureURL ?? '/blank_pfp.jpg'} alt='task preview' height='20' width='20' className="rounded object-cover w-[20px] h-[20px]" />
                        <span>{profile?.name ?? 'No One Assigned'}</span>
                        {
                            majorFeature &&
                            <div className="py-[2px] text-center bg-primary text-secondary font-bold rounded px-1">
                                { majorFeature.name.length >= 22 ? `${majorFeature.name.slice(0, 22)}...` : majorFeature.name }
                            </div>
                        }
                        <span>{task.position}</span>
                    </div>
                </div>
            )}
        </Draggable>
    </> 
}