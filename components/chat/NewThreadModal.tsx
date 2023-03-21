import { Modal, Box, LinearProgress } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Editor, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import Button from "../common/Button";

interface NewThreadModalProps
{
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '35vw',
    maxWidth: '75vw',
    border: '0px solid',
    outline: 'none'
};


export default function NewThreadModal({ show, setShow }: NewThreadModalProps)
{
    const [editorState, setEditorState] = useState( () => EditorState.createEmpty(), );
    const handleClose = () => setShow(false);

    useEffect(() => console.log(editorState.getCurrentContent().getPlainText('\u0001')), [editorState]);

    return <div>
        <Modal
            open={show}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div className="w-full h-full flex flex-col rounded bg-quaternary min-w-[750px]">
                    <div className="py-1 flex flex-row items-center justify-between px-8">
                        <span>New Thread</span>
                    </div>
                    <div className="flex-grow flex flex-col bg-tertiary px-8 py-6 gap-4">
                        <input className="rounded bg-quaternary p-2 px-8 font-semibold text-lg w-full" placeholder="Thread Name" />
                        <textarea className="rounded bg-quaternary p-2 px-8 font-semibold text-lg w-full h-28" placeholder="Thread Description" />
                        <div className="w-full flex flex-col gap-2">
                            <span>First Post</span>
                            <div className="w-full h-64 bg-quaternary px-8 py-2">
                                <Editor 
                                    editorState={editorState} 
                                    onChange={setEditorState} 
                                    placeholder="First Post Contents Here" 
                                />
                            </div>
                        </div>
                        <Button text='Create Thread' onClick={async () => {
                            alert('CREATE NEW THREAD HERE.');
                        }} className="ml-auto bg-transparent" />
                    </div>
                </div>
            </Box>
        </Modal>
    </div>
}