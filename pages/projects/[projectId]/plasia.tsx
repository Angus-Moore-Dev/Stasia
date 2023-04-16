import Button from "@/components/common/Button";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback } from "react";
import ReactFlow, { Background, BackgroundVariant, Connection, Controls, Edge, MiniMap, Panel, addEdge, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 } from "uuid";

interface ProjectRoadmapProps
{
    user: User;
    projectName: string;
}

const initialNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: <p>1</p> } },
    { id: '2', position: { x: 0, y: 100 }, data: { label: <p>2</p> } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

export default function PlasiaVisualBoard({ user, projectName }: ProjectRoadmapProps)
{
    const router = useRouter();
    const projectId = router.query['projectId'] as string;
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return <div className="w-full h-full mx-auto p-8 flex flex-col">
        <Head>
            <title>Stasia | {projectName} Visual Board</title>
        </Head>
        <div className="w-full flex flex-col justify-start gap-4">
            <Button text={`Back to ${projectName}`} onClick={() => {
                router.push(`/projects/${projectId}`);
            }} className="w-fit" />
            <span className="font-semibold text-2xl">{projectName} Visual Board</span>
        </div>
        <div className="flex-grow flex flex-col gap-4">
            <div className="flex-grow rounded-md">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            >
                <Panel position="top-left" style={{
                    background: '#131517',
                }}>
                    <Button text='New Node' onClick={() => {
                        setNodes((nodes) => [...nodes, { id: (nodes.length + 1).toString(), position: { x: 0, y: 0 }, data: { label: (<p className="font-bold text-lg">{v4()}</p>) } }]);
                    }} className="bg-transparent rounded-none" />
                </Panel>
                    <Background variant={BackgroundVariant.Cross} color="#00240b" gap={25} size={5} />
                    <Controls />
                    <MiniMap zoomable pannable />
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