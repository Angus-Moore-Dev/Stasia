import { useCallback, useEffect, useRef, useState } from "react";
import { useClickAway } from "react-use";
import { Handle, NodeProps, Position, useStore, Node, NodeResizer, NodeResizeControl } from "reactflow";

type NodeData = {
    value: number;
};

type CustomNode = Node<NodeData>;

/**
 * This is a bordered box so that uses can containerise stuff.
 */
export default function CustomNode({ data, selected }: NodeProps<NodeData>) {
    const [isEditable, setIsEditable] = useState(false);
    const [text, setText] = useState("Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores inventore assumenda totam, ipsa dolorum praesentium facere reprehenderit sapiente enim veritatis, non veniam beatae saepe esse placeat officiis ex fugiat necessitatibus voluptate alias numquam molestias neque quod doloremque. Tenetur debitis nihil ipsum quidem sint tempore, sapiente voluptate nam aliquam modi ullam unde quis optio fugiat consequuntur officia maiores! Adipisci, eligendi debitis.");
    const thinVineer = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const parentDivRef = useRef<HTMLDivElement>(null);
    const onChange = useCallback((evt: { target: { value: any; }; }) => {
        console.log(evt.target.value);
    }, []);

    
    useEffect(() => {
        if (!isEditable && thinVineer.current)
        {
            // set the width and height of the thin vineer to the width and height of the textarea, so as to preserve it.
            thinVineer.current!.style.width = textareaRef.current!.offsetWidth + "px";
            thinVineer.current!.style.height = textareaRef.current!.offsetHeight + "px";
        }
    }, [isEditable]);

    return <div ref={parentDivRef} className="overflow-y-hidden relative">
        <NodeResizer isVisible={selected} color="#00fe49" onResize={(_, params) => {
            if ((params.direction[0] === 1 && params.direction[1] === 0) || (params.direction[0] === -1 && params.direction[1] === 0))
            {
                console.log('horizontal');
                textareaRef.current!.style.width = params.width + "px";
            }
            else if ((params.direction[0] === 0 && params.direction[1] === 1) || (params.direction[0] === 0 && params.direction[1] === -1))
            {
                console.log('vertical');
                textareaRef.current!.style.height = params.height + "px";
            }
        }} />
        <Handle type="source" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
        <Handle type="source" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
        {
            !isEditable &&
            <div ref={thinVineer} className="absolute w-full h-full border-2 border-quaternary hover:cursor-grab z-50" onDoubleClick={() => setIsEditable(true)} />
        }
        <textarea onDoubleClick={() => setIsEditable(true)} onBlur={() => {
            // set the thin vineer to the height of the textarea, to preserve the film over the top.
            setIsEditable(false);
        }}
        ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} className="w-full h-full bg-transparent focus:outline-none outline-none scrollbar
        aria-disabled:cursor-default aria-disabled:hover:cursor-grab cursor-grab"
        aria-disabled={!isEditable || selected}
        onResize={(event) => {
            console.log(event);
        }} />
    </div>
}