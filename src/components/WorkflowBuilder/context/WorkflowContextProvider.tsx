'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'
import { useNodesState, useEdgesState, type Node, type Edge, type OnNodesChange, type OnEdgesChange } from '@xyflow/react'
import { initialEdges, initialNodes } from '../utils'
import { NodeData } from '../type'


interface WorkflowContextType {
    nodes: Node<NodeData>[],
    edges: Edge[],
    onNodesChange: OnNodesChange<Node<NodeData>>,
    onEdgesChange: OnEdgesChange<Edge>,
    setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,

    selectedNode: Node<NodeData> | null
    setSelectedNode: React.Dispatch<React.SetStateAction<Node<NodeData> | null>>
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export const useWorkflow = () => {
    const context = useContext(WorkflowContext)
    if (!context) {
        throw new Error('useWorkflow must be used within a WorkflowProvider')
    }
    return context
}

interface WorkflowProviderProps {
    children: ReactNode
}

export const WorkflowContextProvider: React.FC<WorkflowProviderProps> = ({ children }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

    const value: WorkflowContextType = {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        setNodes,
        setEdges,
        selectedNode,
        setSelectedNode,
    }

    return (
        <WorkflowContext.Provider value={value}>
            {children}
        </WorkflowContext.Provider>
    );
}