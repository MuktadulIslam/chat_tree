'use client'

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { useNodesState, useEdgesState, type Node, type Edge, type OnNodesChange, type OnEdgesChange } from '@xyflow/react'
import { initialEdges, initialNodes } from '../utils'
import { EndNodeData, NodeData, StateNodeData } from '../type'
import { useStateAnimationBuilder } from './StateAnimationBuilderContextProvider'
import { AnimationType, State } from '../type/stateAnimationBuilderDataType'


interface WorkflowContextType {
    nodes: Node<NodeData>[],
    edges: Edge[],
    onNodesChange: OnNodesChange<Node<NodeData>>,
    onEdgesChange: OnEdgesChange<Edge>,
    setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,

    selectedNode: Node<NodeData> | null
    setSelectedNode: React.Dispatch<React.SetStateAction<Node<NodeData> | null>>

    isSetAnimationModeOn: boolean
    changeExamFlowFiewMode: () => void
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export const useWorkflow = () => {
    const context = useContext(WorkflowContext)
    if (!context) {
        throw new Error('useWorkflow must be used within a WorkflowProvider')
    }
    return context
}


export default function WorkflowContextProvider({ children }: { children: ReactNode }) {
    const { setSelectedStatesForAnimation, setStates } = useStateAnimationBuilder();

    const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
    const [isSetAnimationModeOn, setIsSetAnimationModeOn] = useState<boolean>(true);


    const setStatesForAnimations = useCallback(() => {
        // Filter nodes that are state or end type and each node at least have one in-degree
        const stateNodes = nodes.filter(
            node => (node.type === 'state' || node.type === 'end') &&
                edges.some(edge => node.id === edge.target)
        );

        // Map to State type
        const mappedStates: State[] = stateNodes.map(node => {
            const nodeData = node.data as StateNodeData | EndNodeData;

            const animation_types: AnimationType[] = [];
            if (nodeData.animations_type_has?.pre) animation_types.push('Pre');
            if (nodeData.animations_type_has?.during) animation_types.push('During');
            if (nodeData.animations_type_has?.post) animation_types.push('Post');

            return {
                id: node.id,
                name: nodeData.label,
                state_type: node.type as State['state_type'],
                context: nodeData.context || '',
                animation_types,
                personality: nodeData.personality || 'Neutral',
            };
        });

        setStates(mappedStates);
    }, [setStates, nodes])

    const changeExamFlowFiewMode = () => {
        if (!isSetAnimationModeOn) setStatesForAnimations();
        setSelectedStatesForAnimation(null);
        setIsSetAnimationModeOn(prev => !prev);
    }

    const value: WorkflowContextType = {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        setNodes,
        setEdges,
        selectedNode,
        setSelectedNode,
        isSetAnimationModeOn,
        changeExamFlowFiewMode,
    }

    return (
        <WorkflowContext.Provider value={value}>
            {children}
        </WorkflowContext.Provider>
    );
}