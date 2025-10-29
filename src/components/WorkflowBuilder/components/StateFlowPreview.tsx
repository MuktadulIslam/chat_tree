'use client'

import { memo } from "react"
import { ReactFlow, Background, BackgroundVariant, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes } from '../type'
import { useWorkflow } from '../context/WorkflowContextProvider'

const StateFlowPreview = memo(function StateFlowPreview() {
    const { nodes, edges } = useWorkflow();

    return (
        <ReactFlowProvider>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                minZoom={0.3}
                maxZoom={2}
                fitView
            >
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </ReactFlowProvider>
    )
})

export default StateFlowPreview;