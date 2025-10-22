'use client'

import { useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  NodeChange
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CustomNode, NodeData, NodeType, nodeTypes } from './type'
import { WorkflowContextProvider, useWorkflow } from './context/WorkflowContextProvider'
import EditPanel from './components/EditPanel'



function WorkflowBuilderInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, setNodes, setEdges, selectedNode, setSelectedNode } = useWorkflow();

  const nodeIdCounter = useRef<number>(1)
  const connectingNodeId = useRef<string | null>(null)
  const { screenToFlowPosition } = useReactFlow()


  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: CustomNode) => {
    if (node.type === 'state' || node.type === 'criteria' || node.type === 'end') {
      setSelectedNode(node)

      // Update nodes to reflect selection
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, selected: n.id === node.id, currentInput: '' }
        }))
      )
    }
  }, [setNodes])

  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, selected: false, currentInput: '' }
      }))
    )
  }, [setNodes])


  // Validate connections
  const isValidConnection = useCallback((connection: Edge | Connection): boolean => {
    // If it's an Edge, always return true (for minimap, etc.)
    if ('id' in connection) {
      return true
    }

    const sourceNode = nodes.find(n => n.id === connection.source)
    const targetNode = nodes.find(n => n.id === connection.target)

    if (!sourceNode || !targetNode) return false

    if (sourceNode.type === 'start') {
      const hasOutgoingEdge = edges.some(edge => edge.source === connection.source)
      if (hasOutgoingEdge) return false
    }
    // Start or Criteria → State
    if ((sourceNode.type === 'start' || sourceNode.type === 'criteria') && targetNode.type === 'state') {
      return true
    }

    // State → Criteria or End
    if (sourceNode.type === 'state' && (targetNode.type === 'criteria' || targetNode.type === 'end')) {
      return true
    }

    return false
  }, [nodes, edges])

  const onConnect: OnConnect = useCallback(
    (params) => {
      if (isValidConnection(params)) {
        const targetNode = nodes.find(n => n.id === params.target)
        const isEndNode = targetNode?.type === 'end'

        setEdges((eds) => addEdge({
          ...params,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            ...(isEndNode && { color: '#ef4444' }) // red arrow for end nodes
          },
          style: {
            strokeWidth: 2,
            ...(isEndNode && {
              stroke: '#ef4444', // red color
              strokeDasharray: '5, 5' // dotted pattern
            })
          }
        }, eds))
      }
    },
    [setEdges, isValidConnection, nodes])

  // Track connection start
  const onConnectStart = useCallback((_: any, params: { nodeId: string | null; handleId: string | null; handleType: string | null }) => {
    connectingNodeId.current = params.nodeId
  }, [])

  // Handle edge drag end - auto-create nodes
  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // If no connecting node, return
      if (!connectingNodeId.current) return

      const sourceNode = nodes.find(n => n.id === connectingNodeId.current)
      if (!sourceNode) {
        connectingNodeId.current = null
        return
      }

      // Check if we dropped on the pane (empty space) or on a node
      // If dropped on a node, the onConnect handler will handle it, so we return early
      const targetElement = event.target as HTMLElement
      const targetIsPane = targetElement?.classList.contains('react-flow__pane')

      // Also check if we're over any node element
      const isOverNode = targetElement?.closest('.react-flow__node')

      if (!targetIsPane || isOverNode) {
        // We dropped on a node or non-pane element, let onConnect handle it
        connectingNodeId.current = null
        return
      }

      // Check if Start node already has an outgoing edge
      if (sourceNode.type === 'start') {
        const hasOutgoingEdge = edges.some(edge => edge.source === sourceNode.id)
        if (hasOutgoingEdge) {
          connectingNodeId.current = null
          return
        }
      }

      // Determine what type of node to create based on source
      let newNodeType: string | null = null
      if (sourceNode.type === 'start' || sourceNode.type === 'criteria') {
        newNodeType = 'state'
      } else if (sourceNode.type === 'state') {
        newNodeType = 'criteria'
      }

      if (!newNodeType) {
        connectingNodeId.current = null
        return
      }

      // Get the position from the event
      const clientX = 'clientX' in event ? event.clientX : event.touches?.[0]?.clientX
      const clientY = 'clientY' in event ? event.clientY : event.touches?.[0]?.clientY

      if (clientX === undefined || clientY === undefined) {
        connectingNodeId.current = null
        return
      }

      const position = screenToFlowPosition({
        x: clientX,
        y: clientY,
      })

      // Create new node
      nodeIdCounter.current += 1
      const newNodeId = `${newNodeType}-${nodeIdCounter.current}`

      const newNode: CustomNode = {
        id: newNodeId,
        type: newNodeType,
        position,
        data: {
          label: newNodeType.charAt(0).toUpperCase() + newNodeType.slice(1),
          ...(newNodeType === 'criteria' ? { subCriterias: [] } : {}),
          ...(newNodeType === 'state' ? {
            personality: 'Neutral',
            context: '',
            retryCount: 1,
            exemplars: []
          } : {})
        },
      }

      // Add the new node
      setNodes((nds) => [...nds, newNode])

      // Create edge from source to new node
      const newEdge: Edge = {
        id: `e-${connectingNodeId.current}-${newNodeId}`,
        source: connectingNodeId.current,
        target: newNodeId,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2 }
      }

      setEdges((eds) => [...eds, newEdge])
      connectingNodeId.current = null
    },
    [nodes, edges, setNodes, setEdges, screenToFlowPosition]
  )

  // Add nodes
  const addNode = useCallback((type: NodeType) => {
    nodeIdCounter.current += 1
    const id = `${type}-${nodeIdCounter.current}`

    let newNode: CustomNode = {
      id,
      type,
      position: {
        x: Math.random() * 400 + 200,
        y: Math.random() * 300 + 100
      },
      data: { label: type.charAt(0).toUpperCase() + type.slice(1) },
    }

    if (type === 'criteria') {
      newNode.data.subCriterias = []
    } else if (type === 'state') {
      newNode.data = {
        ...newNode.data,
        personality: 'Neutral',
        context: '',
        retryCount: 1,
        exemplars: []
      }
    }

    setNodes((nds) => [...nds, newNode])
  }, [setNodes])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'e':
            event.preventDefault()
            addNode('end')
            break
          case 's':
            event.preventDefault()
            addNode('state')
            break
          case 'c':
            event.preventDefault()
            addNode('criteria')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [addNode])



  // Preventing to delete the Start Node
  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<NodeData>>[]) => {
      // Filter out any removal changes for node with id '1'
      const filteredChanges = changes.filter((change) => {
        if (change.type === 'remove' && change.id === 'startnode') {
          return false;
        }
        if (change.type === 'remove' && selectedNode && change.id === selectedNode.id) {
          onPaneClick();
        }
        return true;
      });
      onNodesChange(filteredChanges);
    },
    [onNodesChange, selectedNode]
  );

  return (
    <div className="w-full h-screen flex flex-col relative">
      {/* <TopControls addNode={addNode} /> */}
      <EditPanel />

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          isValidConnection={isValidConnection}
          deleteKeyCode={["Delete"]}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  )
}

export default function WorkflowBuilder() {
  return (
    <WorkflowContextProvider>
      <ReactFlowProvider>
        <WorkflowBuilderInner />
      </ReactFlowProvider>
    </WorkflowContextProvider>
  )
}