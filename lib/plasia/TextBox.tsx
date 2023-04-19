import { useCallback, useEffect, useRef, useState } from "react";
import { useClickAway } from "react-use";
import { Handle, NodeProps, Position, useStore, Node, NodeResizer, NodeResizeControl } from "reactflow";

type NodeData = {
    value: number;
};

type BorderedBox = Node<NodeData>;

/**
 * This is a bordered box so that uses can containerise stuff.
 */
export default function TextBox({ data, selected, dragging }: NodeProps<NodeData>) {
    const [isEditable, setIsEditable] = useState(false);
    const [text, setText] = useState("Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores inventore assumenda totam, ipsa dolorum praesentium facere reprehenderit sapiente enim veritatis, non veniam beatae saepe esse placeat officiis ex fugiat necessitatibus voluptate alias numquam molestias neque quod doloremque. Tenetur debitis nihil ipsum quidem sint tempore, sapiente voluptate nam aliquam modi ullam unde quis optio fugiat consequuntur officia maiores! Adipisci, eligendi debitis.");
    const thinVineer = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const parentDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isEditable && thinVineer.current)
        {
            // set the width and height of the thin vineer to the width and height of the textarea, so as to preserve it.
            thinVineer.current!.style.width = textareaRef.current!.offsetWidth + "px";
            thinVineer.current!.style.height = textareaRef.current!.offsetHeight + "px";
        }
    }, [isEditable]);

    return <>
        <NodeResizer isVisible={selected} color="#00fe49" onResize={(_, params) => {
            textareaRef.current!.style.width = params.width + "px";
            // parentDivRef.current!.style.width = params.width + "px";
            textareaRef.current!.style.height = params.height + "px";
            // parentDivRef.current!.style.height = params.height + "px";

            if (!isEditable && thinVineer.current)
            {
                // set the width and height of the thin vineer to the width and height of the textarea, so as to preserve it.
                thinVineer.current!.style.width = textareaRef.current!.offsetWidth + "px";
                thinVineer.current!.style.height = textareaRef.current!.offsetHeight + "px";
            }
        }} handleStyle={{
            width: '20px',
            height: '20px',
            border: '2px solid #00fe49',
            background: '#090909',
        }} />
        <Handle type="target" position={Position.Left}  style={{
            background: "#00fe49",
            color: 'black'
        }}/>
        <Handle type="source" position={Position.Right} style={{
            background: "#00fe49",
        }} />
        {
            !isEditable &&
            <div ref={thinVineer} className="absolute w-full h-full hover:cursor-grab z-50" onDoubleClick={() => {
                setIsEditable(true);
                // Focus the ref
                textareaRef.current!.focus();
                // Set the current value of the textarea to the end of the text.
                textareaRef.current!.selectionStart = text.length;
            }} />
        }
        <textarea onDoubleClick={() => setIsEditable(true)} onBlur={() => {
            // set the thin vineer to the height of the textarea, to preserve the film over the top.
            setIsEditable(false);
        }}
        ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} className="w-full h-full bg-transparent focus:outline-none outline-none scrollbar p-2
        aria-disabled:cursor-default aria-disabled:hover:cursor-grab cursor-grab"
        aria-disabled={!isEditable || selected}
        onResize={(event) => {
            console.log(event);
        }} />
    </>
}