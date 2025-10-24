import { MarkerType, type Node, type Edge } from '@xyflow/react'
import { NodeData } from './type'

export const initialNodes: Node<NodeData>[] = [
    {
        id: 'startnode',
        type: 'start',
        position: { x: 100, y: 200 },
        data: { label: 'START' },
    },
    {
        id: 'state-1',
        type: 'state',
        position: { x: 270, y: 200 },
        data: {
            label: 'State',
            personality: 'Neutral',
            context: '',
            retryCount: 1,
            exemplars: [],
            animations_type_has: {
                pre: false,
                during: false,
                post: false
            }
        },
    },
]

export const initialEdges: Edge[] = [
    {
        id: 'e-start-1-state-1',
        source: 'startnode',
        target: 'state-1',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2 }
    }
]