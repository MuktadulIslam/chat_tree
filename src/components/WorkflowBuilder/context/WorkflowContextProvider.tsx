'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'
import { useNodesState, useEdgesState, addEdge, useReactFlow, type Node, type Edge, type Connection, type OnNodesChange, type OnEdgesChange, NodeChange } from '@xyflow/react'
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

    // State
    //   nodes: Node<NodeData>[]
    //   edges: Edge[]

    //   // Refs
    //   nodeIdCounter: React.MutableRefObject<number>
    //   connectingNodeId: React.MutableRefObject<string | null>

    //   // React Flow handlers
    //   onNodesChange: OnNodesChange
    //   onEdgesChange: OnEdgesChange
    //   screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number }

    //   // Setters
    //   setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>
    //   setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
    //   setSelectedNode: React.Dispatch<React.SetStateAction<Node<NodeData> | null>>

    //   // Actions
    //   onNodeClick: (event: React.MouseEvent, node: CustomNode) => void
    //   onPaneClick: () => void
    //   updateNodeLabel: (newLabel: string) => void
    //   updateCurrentExample: (text: string) => void
    //   addExample: (text: string, importance: ImportanceLevel) => void
    //   editExample: (index: number, text: string, importance: ImportanceLevel) => void
    //   deleteExample: (index: number) => void
    //   updateStateProperty: (property: keyof StateNodeData, value: any) => void
    //   addExemplar: (text: string) => void
    //   editExemplar: (index: number, text: string) => void
    //   deleteExemplar: (index: number) => void
    //   onConnect: (connection: Connection) => void
    //   onConnectStart: (event: React.MouseEvent | React.TouchEvent, params: { nodeId: string | null; handleType: string | null }) => void
    //   onConnectEnd: (event: MouseEvent | TouchEvent) => void
    //   handleNodesChange: OnNodesChange
    //   isValidConnection: (connection: Connection) => boolean
    //   addNode: (type: string) => void
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