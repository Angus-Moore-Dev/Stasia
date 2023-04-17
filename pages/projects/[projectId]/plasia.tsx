import Button from "@/components/common/Button";
import TextUpdaterNode from "@/lib/plasia/BorderedBox";
import TextBox from "@/lib/plasia/BorderedBox";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import ReactFlow, { Edge, OnNodesChange, applyNodeChanges, OnEdgesChange, applyEdgeChanges, OnConnect, addEdge, Panel, Background, BackgroundVariant, Controls, MiniMap, DefaultEdgeOptions, FitViewOptions, NodeTypes, useEdgesState, useNodesState, Connection } from "reactflow";
import 'reactflow/dist/style.css';
import { v4 } from "uuid";

interface ProjectRoadmapProps
{
    user: User;
    projectName: string;
}


const initialNodes = [
    { id: v4(), type: 'textUpdater', position: { x: 1600, y: 500 }, data: { value: 123 } },
    { id: v4(), type: 'textUpdater', position: { x: 0, y: 0 }, data: { value: 123 } },
];

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: false,
};

const nodeTypes: NodeTypes = {
    custom: TextUpdaterNode,
};

export default function PlasiaVisualBoard({ user, projectName }: ProjectRoadmapProps)
{
    const router = useRouter();
    const projectId = router.query['projectId'] as string;
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
    const nodeTypes = useMemo(() => ({ textUpdater: TextUpdaterNode }), []);
    return <div className="w-full h-full mx-auto p-8 flex flex-col">
        <Head>
            <title>Stasia | {projectName} Visual Board</title>
        </Head>
        <div className="w-full flex flex-row justify-start items-center gap-10">
            <Button text={`Back to ${projectName}`} onClick={() => {
                router.push(`/projects/${projectId}`);
            }} className="w-fit" />
            <span className="font-semibold text-lg">{projectName} Visual Board</span>
        </div>
        <div className="flex-grow flex flex-col gap-4">
            <div className="flex-grow rounded-md">
            <ReactFlow
                minZoom={0.1}
                maxZoom={2.5}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitViewOptions={fitViewOptions}
                defaultEdgeOptions={defaultEdgeOptions}
                proOptions={{
                    hideAttribution: true
                }}
            >
                <Panel position="top-left" className="flex flex-row gap-2">
                    <Button text='Add Box' onClick={() => {
                        setNodes((nodes) => [...nodes, { id: v4(), type: 'textUpdater', position: { x: 0, y: 0 }, data: { value: 123 } }]);
                    }} className="bg-tertiary w-48" />
                    <Button text='Add Text' onClick={() => {
                        setNodes((nodes) => [...nodes, { id: v4(), type: 'textUpdater', position: { x: 0, y: 0 }, data: { value: 123 } }]);
                    }} className="bg-tertiary w-48" />
                    <Button text='Add Diamond' onClick={() => {
                        setNodes((nodes) => [...nodes, { id: v4(), type: 'textUpdater', position: { x: 0, y: 0 }, data: { value: 123 } }]);
                    }} className="bg-tertiary w-48" />
                </Panel>
                    <Background variant={BackgroundVariant.Cross} color="#00240b" gap={25} size={5} />
                    <Controls />
                    <MiniMap 
                        zoomable
                        pannable
                        nodeColor={'#00fe49'}
                        nodeStrokeColor={'#00fe49'}
                        maskColor="rgba(0, 0, 0, 0.8)"
                        style={{
                            backgroundColor: '#131517',
                        }}
                    />
                </ReactFlow>
            </div>
        </div>
    </div>
}

export const getServerSideProps = async (context: GetServerSidePropsContext) =>
{
	const supabaseClient = createServerSupabaseClient(context);
	const { data: { session }} = await supabaseClient.auth.getSession();
	if (!session)
	{
		return {
			redirect: {
				destination: '/sign-in',
				permanent: false
			}
		}
	}

    const projectName = (await supabaseClient.from('projects').select('name').eq('id', context.query['projectId'] as string).single()).data?.name as string;

	return {
		props: {
			user: session?.user ?? null,
            projectName
		}
	}
}