import { FeatureType, MinorFeature } from "@/models/projects/MinorFeature";
import Button from "../common/Button";
import { useEffect, useRef, useState } from "react";
import { MajorFeature } from "@/models/projects/MajorFeature";
import Link from "next/link";
import { Task, TaskState, TaskType } from "@/models/projects/Task";
import { Profile } from "@/models/me/Profile";
import Image from "next/image";
import CreateIcon from '@mui/icons-material/Create';
import { supabase } from "@/lib/supabaseClient";
import createToast from "@/functions/createToast";
import TaskModal from "./TaskModal";

interface MajorFeatureBoxProps
{
    feature: MajorFeature;
}

export function MajorFeatureBox({ feature }: MajorFeatureBoxProps)
{
    return <Link href={`/projects/feature/major/${feature.id}`} className="w-full lg:w-[32%] h-96 rounded bg-tertiary p-4 flex flex-col gap-3 transition hover:bg-primary hover:text-secondary hover:cursor-pointer">
        <p className="text-lg font-semibold">{feature.name}</p>
        <small className="pb-1 border-b-[1px] border-b-primary w-full">Description</small>
        <p className="-mt-1 overflow-y-auto scrollbar">{feature.description ? feature.description : 'No Description...'}</p>
        <small className="">Objective</small>
        <p className="-mt-3 overflow-y-auto scrollbar">{feature.objective ? feature.objective : 'No Objective...'}</p>
        <div className="flex-grow flex items-end flex-row justify-between">
            <small>Click to Open</small>
            <small>{feature.id}</small>
        </div>
    </Link>
}



interface MinorFeatureBox
{
    feature: MinorFeature;
    setFeature: (feature: MinorFeature) => void;
    deleteMinorFeature: () => void;
}

export function MinorFeatureBox({ feature, setFeature, deleteMinorFeature }: MinorFeatureBox)
{
    const [featureData, setfeatureData] = useState(feature);
    useEffect(() => setFeature(featureData), [featureData]);
    
    return <div className="w-[49%] h-[750px] rounded bg-tertiary p-4 flex flex-col gap-2">
        <div className="flex flex-row justify-between items-center">
            <span className="font-medium">New Minor Feature</span>
            <Button className="text-red-500 transition hover:bg-red-500 hover:text-zinc-100 rounded w-fit" text='Flatline' onClick={() => deleteMinorFeature()} />
        </div>
        <input value={featureData.name} onChange={(e) => setfeatureData({...featureData, name: e.target.value})} className='w-full p-2 outline-none bg-quaternary font-medium text-lg rounded' placeholder="Minor Feature Name" />
        <textarea value={featureData.description} onChange={(e) => setfeatureData({...featureData, description: e.target.value})} className='w-full p-2 outline-none bg-quaternary font-medium rounded h-64' placeholder="Description" />
        <textarea value={featureData.objective} onChange={(e) => setfeatureData({...featureData, objective: e.target.value})} className='w-full p-2 outline-none bg-quaternary font-medium rounded h-32' placeholder="Objective" />
        <span>Feature Type</span>
        <select defaultValue={feature.featureType} className="w-64 p-2 bg-quaternary text-zinc-100 font-semibold -mt-2" onChange={(e) => setfeatureData({...featureData, featureType: e.target.value as FeatureType})}>
            {
                Object.values(FeatureType).map(type => <option key={type} value={type}>{type.valueOf()}</option>)
            }
        </select>
        <span>Expected Completion Date</span>
        <input value={featureData.expectedCompletionDate} type='date' className="bg-quaternary text-zinc-100 font-medium rounded p-2 w-64 -mt-2" style={{colorScheme: 'dark'}} onChange={(e) => 
        {
            setfeatureData({...featureData, expectedCompletionDate: e.target.value});
        }} />
        <small>id: {feature.id}</small>
    </div>
}




interface TaskBoxProps
{
    task: Task;
    profile: Profile | undefined;
}

export function TaskBox({ task, profile }: TaskBoxProps)
{
    const [titleText, setTitleText] = useState(task.name);
    const [isEditable, setIsEditable] = useState(false);
    const [taskType, setTaskType] = useState<TaskType>(task.taskType);
    const [taskColour, setTaskColour] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [showEditButton, setShowEditButton] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskState, setTaskState] = useState(task.taskState);
    const [taskStateColour, setTaskStateColour] = useState('');

    useEffect(() => {
        setTaskType(task.taskType);
        setTitleText(task.name);
        setTaskState(task.taskState);
        console.log('NEW TASK STATE::', task.taskState);
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
        if (isEditable)
        {
            inputRef.current?.focus();
        }
    }, [isEditable]);


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

    return <>
        <TaskModal task={task} profile={profile} show={showTaskModal} setShow={setShowTaskModal} />
        <div className='w-full px-2 bg-tertiary text-zinc-100 transition hover:bg-quaternary hover:cursor-pointer flex flex-row items-center gap-4 rounded min-h-[39px] min-w-[450px]'
            onBlur={() => {setIsEditable(false)}}
            onMouseOver={() => setShowEditButton(true)}
            onMouseLeave={() => setShowEditButton(false)}
        >
            <p>{task.id}</p>
            <select defaultValue={taskType} className={`bg-transparent h-full hover:text-zinc-100 font-semibold text-center rounded-sm w-32 min-w-[128px] max-w-[128px] ${taskState === TaskState.Completed && 'text-zinc-100'}`} 
            style={{ backgroundColor: taskColour }} onChange={async (e) => {
                const res = await supabase.from('project_tickets').update({ taskType: e.target.value }).eq('id', task.id);
                if (!res.error)
                    setTaskType(e.target.value as TaskType);
                else
                    createToast(res.error.message, true);
            }}>
                {
                    Object.values(TaskType).map(type => <option key={type} value={type}>{type}</option>)
                }
            </select>
            <div className="flex flex-row flex-grow">
                {
                    !isEditable &&
                    <>
                        <button className="w-fit text-left px-2 font-medium mr-2" onClick={() => setShowTaskModal(true)} style={{
                            color: titleText ? '#fffff': '#7f7f7f',
                        }}>
                            {titleText ? titleText : 'No Task Description'}
                        </button>
                        {
                            showEditButton &&
                            <button onClick={() => {
                                setIsEditable(true);
                                inputRef.current?.focus();
                            }} className="transition hover:text-primary">
                                <CreateIcon fontSize="small" />
                            </button>
                        }
                        <div className="flex-grow -my-1" onClick={() => setShowTaskModal(true)} />
                    </>
                }
                {
                    isEditable &&
                    <input 
                        ref={inputRef}
                        value={titleText}
                        onChange={(e) => setTitleText(e.target.value)} 
                        readOnly={!isEditable} 
                        onBlur={() => setIsEditable(false)}
                        maxLength={200}
                        className={`bg-transparent outline-none px-2 flex-grow font-medium rounded text-zinc-100`}
                        placeholder="Provide a Task Title Here"
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter')
                            {
                                await supabase.from('project_tickets').update({ name: titleText }).eq('id', task.id);
                                inputRef.current?.blur();
                            }
                        }}
                    />
                }
            </div>
            <select defaultValue={taskState} value={taskState} className={`bg-transparent h-full text-secondary font-bold text-center rounded-sm w-32`} 
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
            <Image src={profile?.profilePictureURL ?? '/blank_pfp.jpg'} alt='task preview' height='20' width='20' className="rounded object-cover w-[20px] h-[20px]" />
            <button className="font-bold transition hover:text-red-500 w-3 h-full" onClick={async () => {
                const res = await supabase.from('project_tickets').delete().eq('id', task.id);
                if (res.error)
                {
                    createToast(res.error.message, true);
                }
            }}>
                X
            </button>
        </div>
    </>
    
}