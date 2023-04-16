import { Modal, Box, LinearProgress } from "@mui/material";
import Button from "../common/Button";
import { supabase } from "@/lib/supabaseClient";
import { TaskCategory } from "@/models/projects/TaskCategory";
import { useEffect, useState } from "react";
import createToast from "@/functions/createToast";

interface NewTaskCategoryModalProps
{
    open: boolean;
    onClose: () => void;
    projectId: string;
}

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

export default function NewTaskCategoryModal({ open, onClose, projectId }: NewTaskCategoryModalProps)
{
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!open)
        {
            setName('');
            setDescription('');
        }
    }, [open]);

    return <div>
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div className="w-[35vw] h-fit bg-quaternary rounded flex flex-col gap-2">
                    <div className="w-full p-1 bg-tertiary px-4">
                        New Task Category
                    </div>
                    <div className="flex-grow flex flex-col gap-2 p-4">
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold">Category Name</span>
                            <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="px-4 py-1 outline-none bg-tertiary rounded w-full font-semibold" placeholder="Name" maxLength={64} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold">Category Description</span>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="px-4 py-1 outline-none bg-tertiary rounded w-full font-semibold" placeholder="Description" maxLength={256} />
                        </div>
                    </div>
                    <div className="w-full p-1 bg-tertiary px-4 flex justify-end gap-2">
                        {
                            isSaving &&
                            <LinearProgress color='inherit' className='text-primary h-6 rounded-b-sm w-full px-4' />
                        }
                        {
                            !isSaving &&
                            <>
                            <Button text="Cancel" onClick={onClose} className="bg-transparent rounded" />
                            <Button text="Create" onClick={async () => 
                            {
                                setIsSaving(true);
                                const category = new TaskCategory();
                                category.projectId = projectId;
                                category.name = name;
                                category.description = description;
                                const res = await supabase.from('task_categories').insert([category]);
                                res.error && createToast(res.error.message, true);
                                !res.error && createToast('Category created successfully', false);
                                if (!res.error)
                                    onClose();
                                setIsSaving(false);
                            }} className="bg-transparent rounded" />
                            </>
                        }
                    </div>
                </div>
            </Box>
        </Modal>
    </div>
}