import { useCallback, useRef, useState } from "react";
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
    const onChange = useCallback((evt: { target: { value: any; }; }) => {
        console.log(evt.target.value);
    }, []);

    return <div className="">
        <NodeResizer isVisible={selected} minWidth={250} minHeight={50} color="#00fe49" />
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
        <div>Custom node</div>
        <div>A big number: {data.value}</div>
    </div>
}