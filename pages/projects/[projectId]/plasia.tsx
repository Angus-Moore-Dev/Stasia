import Button from "@/components/common/Button";
import BorderedBox from "@/lib/plasia/BorderedBox";
import TextBox from "@/lib/plasia/TextBox";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Dispatch, ForwardRefExoticComponent, HTMLAttributes, MouseEvent, RefAttributes, SetStateAction, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Edge, OnNodesChange, applyNodeChanges, OnEdgesChange, applyEdgeChanges, OnConnect, addEdge, Panel, Background, BackgroundVariant, Controls, MiniMap, DefaultEdgeOptions, FitViewOptions, NodeTypes, useEdgesState, useNodesState, Connection, MarkerType, OnInit, ReactFlowProvider, ReactFlowInstance } from "reactflow";
import 'reactflow/dist/style.css';
import { v4 } from "uuid";

interface ProjectRoadmapProps
{
    user: User;
    projectName: string;
}

const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: false,
};


export default function PlasiaVisualBoard({ user, projectName }: ProjectRoadmapProps)
{
    const [isDropping, setIsDropping] = useState(false);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const parentRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const projectId = router.query['projectId'] as string;
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<any, any>>();
    const onConnect = useCallback(
        (params: Edge | Connection) =>
        setEdges((eds) =>
            addEdge({ ...params, type: 'floating', markerEnd: { type: MarkerType.Arrow } }, eds)
        ),
        []
    );
    const nodeTypes = useMemo(() => ({ 
        borderedBox: BorderedBox, 
        textBox: TextBox 
    }), []);

    useEffect(() => {

    }, [isDropping]);

    return <div className="w-full h-full mx-auto p-8 flex flex-col">
        <Head>
            <title>Stasia | {projectName} Visual Board</title>
        </Head>
        <div className="w-full flex flex-row justify-start items-center gap-10">
            <Button text={`Back to ${projectName}`} onClick={() => {
                router.push(`/projects/${projectId}`);
            }} className="w-fit" />
            <span className="font-semibold text-lg">{projectName} Visual Board</span>
            <span className="font-semibold text-lg">THIS IS IN DEVELOPMENT, IT IS NON FUNCTIONAL.</span>
        </div>
        <div className="flex-grow flex flex-col gap-4">
            <ReactFlowProvider>
                <div ref={reactFlowWrapper} className="flex-grow rounded-md">
                    <ReactFlow
                        ref={parentRef}
                        minZoom={0.1}
                        maxZoom={2.5}
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        onInit={(init) => setReactFlowInstance(init)}
                        fitViewOptions={fitViewOptions}
                        defaultEdgeOptions={defaultEdgeOptions}
                        proOptions={{
                            hideAttribution: true
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
                            const event = e as MouseEvent;
                            const position = reactFlowInstance!.project({
                                x: event.clientX - reactFlowBounds!.left - 40,
                                y: event.clientY - reactFlowBounds!.top - 25
                            });
                            setNodes((nodes) => [...nodes, { id: v4(), type: 'borderedBox', position: { x: position.x, y: position.y }, data: { value: 123 } }]);
                        }}
                    >
                        <Panel position="top-left" className="flex flex-row gap-2" style={{
                            fontFamily: 'Rajdhani'
                        }}>
                            <Button text='Add Box' onClick={() => {
                                alert('non functional');
                                setIsDropping(true);
                                // setNodes((nodes) => [...nodes, { id: v4(), type: 'borderedBox', position: { x: 0, y: 0 }, data: { value: 123 } }]);
                            }} className="bg-tertiary w-48" />
                            <Button text='Add Text' onClick={() => {
                                alert('non functional');
                                setIsDropping(true);
                                // setNodes((nodes) => [...nodes, { id: v4(), type: 'textBox', position: { x: 0, y: 0 }, data: { value: 123 } }]);
                            }} className="bg-tertiary w-48" />
                            <Button text='Add Diamond' onClick={() => {
                                alert('non functional');
                                // setNodes((nodes) => [...nodes, { id: v4(), type: 'borderedBox', position: { x: 0, y: 0 }, data: { value: 123 } }]);
                            }} className="bg-tertiary w-48" />
                        </Panel>
                            <Background variant={BackgroundVariant.Cross} color="#00fe493f" gap={88} size={5} />
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
            </ReactFlowProvider>
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