import { MajorFeature } from "@/models/projects/MajorFeature";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import Button from "../common/Button";
import { supabase } from "@/lib/supabaseClient";
import createToast from "@/functions/createToast";
import { useRouter } from "next/router";

interface FeatureDeletionDialogProps
{
    feature: MajorFeature;
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
}

export default function FeatureDeletionDialog({ feature, show, setShow }: FeatureDeletionDialogProps)
{
    const router = useRouter();
    // There's an issue with white pixels on the corners of the dialog. I'm not sure why and it's actually annoying me to no end.
    return <Dialog open={show} onClose={() => setShow(false)} className="text-zinc-100">
        <p className="w-full bg-quaternary text-zinc-100 text-lg  py-2 text-center font-semibold">
            Are you sure you want to delete this feature?
        </p>
        <DialogContent className="bg-quaternary text-zinc-100">
            This will delete all tasks associated with this feature.
        </DialogContent>
        <DialogActions className="text-zinc-100 bg-quaternary">
            <Button text='Cancel' onClick={() => setShow(false)} />
            <Button text='Delete' onClick={async () => {
                const res = await supabase.from('project_major_features').delete().eq('id', feature.id);
                res.error && createToast(res.error.message, true);
                !res.error && createToast('Successfully Deleted Feature', false);
                if (!res.error)
                    {
                        setShow(false);
                        router.push(`/projects/${feature.projectId}`);
                    }
            }} className="text-red-500 hover:bg-red-500 hover:text-zinc-100" />
        </DialogActions>
    </Dialog>
}