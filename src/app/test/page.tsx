'use client'

import { useState, useCallback, useRef, useEffect, memo } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  NodeChange
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// Type Definitions
type ImportanceLevel = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'

interface Example {
  text: string
  importance: ImportanceLevel
}

interface NodeData {
  label: string
  selected?: boolean
  examples?: Example[]
  currentInput?: string
  personality?: 'Angry' | 'Annoyed' | 'Neutral' | 'Content' | 'Happy'
  context?: string
  retryCount?: number
  exemplars?: string[]
  [key: string]: unknown
}

interface StartNodeData extends NodeData { }
interface EndNodeData extends NodeData { }
interface StateNodeData extends NodeData {
  personality: 'Angry' | 'Annoyed' | 'Neutral' | 'Content' | 'Happy'
  context: string
  retryCount: number
  exemplars: string[]
}
interface CriteriaNodeData extends NodeData {
  examples: Example[]
}

type CustomNode = Node<NodeData>

// Custom Node Components
const StartNode = memo(function StartNode({ data }: { data: StartNodeData }) {
  return (
    <div className="px-6 py-3 shadow-lg rounded-lg bg-green-200 border-2 border-green-500 text-black font-bold">
      <div>START</div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500"
      />
    </div>
  )
})

const EndNode = memo(function EndNode({ data }: { data: EndNodeData }) {
  const isSelected = data.selected
  return (
    <div className={`px-6 py-3 shadow-lg rounded-lg bg-red-200 border-2 border-red-400 text-black font-bold transition-all
            ${isSelected ? 'shadow-2xl ring-4 ring-red-400' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-500"
      />
      <div>END</div>
    </div>
  )
})

const StateNode = memo(function StateNode({ data, id }: { data: StateNodeData; id: string }) {
  const isSelected = data.selected
  return (
    <div className={`px-6 py-3 shadow-lg rounded-lg bg-blue-100 border-2 border-blue-300 text-black min-w-[120px] transition-all
            ${isSelected ? 'shadow-2xl ring-4 ring-blue-300' : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500"
      />
      <div className="text-center font-semibold">{data.label}</div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500"
      />
    </div>
  )
})

const CriteriaNode = memo(function CriteriaNode({ data, id }: { data: CriteriaNodeData; id: string }) {
  const examples = data.examples || []
  const currentInput = data.currentInput || ''
  const isSelected = data.selected

  const getImportanceColor = (importance: ImportanceLevel): string => {
    switch (importance) {
      case 'Very High': return 'bg-red-600 text-white'
      case 'High': return 'bg-orange-500 text-white'
      case 'Medium': return 'bg-yellow-400 text-black'
      case 'Low': return 'bg-blue-400 text-white'
      case 'Very Low': return 'bg-gray-400 text-white'
      default: return 'bg-yellow-400 text-black'
    }
  }

  return (
    <div className={`shadow-lg rounded-lg bg-yellow-100 border-2 text-gray-900 min-w-[240px] max-w-[500px] transition-all border-yellow-300
            ${isSelected ? 'shadow-2xl ring-4 ring-yellow-300' : ''}`}>
      <div className={`w-full px-4 py-2 text-center font-semibold ${examples.length > 0 || currentInput ? 'border-b-2' : ''} border-yellow-300`}>
        {data.label}
      </div>
      {(examples.length > 0 || currentInput) &&
        <div className="w-full p-2 space-y-1.5">
          {examples.map((ex, idx) => (
            <div key={idx} className={`relative py-1 px-2 text-sm rounded-md ${getImportanceColor(ex.importance)}`}>
              <Handle
                type="source"
                position={Position.Right}
                id={`example-${idx}`}
                className="!w-3 !h-3 !bg-emerald-500 !-mr-2.5"
              />
              {ex.text}
            </div>
          ))}
          {currentInput && (
            <div className="relative py-1 px-2 text-sm italic border border-amber-600">
              <Handle
                type="source"
                position={Position.Right}
                id={`example-preview`}
                className="!w-3 !h-3 !bg-emerald-500 !-mr-2.5"
                style={{ opacity: 0 }}
              />
              {currentInput}
            </div>
          )}
        </div>
      }
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500 ml-[-1px]"
      />
    </div>
  )
})

const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  state: StateNode,
  criteria: CriteriaNode,
}

const initialNodes: Node<NodeData>[] = [
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
      exemplars: []
    },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'e-start-1-state-1',
    source: 'startnode',
    target: 'state-1',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 2 }
  }
]

function WorkflowBuilderInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [currentExample, setCurrentExample] = useState<string>('')
  const [currentImportance, setCurrentImportance] = useState<ImportanceLevel>('Medium')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [currentExemplar, setCurrentExemplar] = useState<string>('')
  const [editingExemplarIndex, setEditingExemplarIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const exemplarInputRef = useRef<HTMLInputElement>(null)
  const nodeIdCounter = useRef<number>(1)
  const connectingNodeId = useRef<string | null>(null)
  const { screenToFlowPosition } = useReactFlow()

  // Sync selectedNode with nodes to always have latest data
  useEffect(() => {
    if (selectedNode) {
      const updatedNode = nodes.find(n => n.id === selectedNode.id)
      if (updatedNode) {
        setSelectedNode(updatedNode)
      }
    }
  }, [nodes, selectedNode])

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: CustomNode) => {
    if (node.type === 'state' || node.type === 'criteria' || node.type === 'end') {
      setSelectedNode(node)
      setEditValue(node.data.label)
      setCurrentExample('')
      setCurrentImportance('Medium')
      setEditingIndex(null)
      setCurrentExemplar('')
      setEditingExemplarIndex(null)

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
    setCurrentExample('')
    setCurrentImportance('Medium')
    setEditingIndex(null)
    setCurrentExemplar('')
    setEditingExemplarIndex(null)
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, selected: false, currentInput: '' }
      }))
    )
  }, [setNodes])

  // Update node label
  const updateNodeLabel = useCallback((newLabel: string) => {
    if (!selectedNode) return

    let updatedNode: CustomNode | null = null

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          updatedNode = {
            ...node,
            data: { ...node.data, label: newLabel },
          }
          return updatedNode
        }
        return node
      })
    )

    // Update selectedNode to reflect changes
    if (updatedNode) {
      setSelectedNode(updatedNode)
    }
  }, [selectedNode, setNodes])

  // Update current example input
  const updateCurrentExample = useCallback((text: string) => {
    if (!selectedNode || selectedNode.type !== 'criteria') return

    setCurrentExample(text)

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              currentInput: text
            },
          }
        }
        return node
      })
    )
  }, [selectedNode, setNodes])

  // Add or update example in criteria node
  const addExample = useCallback(() => {
    if (!selectedNode || selectedNode.type !== 'criteria' || !currentExample.trim()) return

    let updatedNode: CustomNode | null = null

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          const examples = node.data.examples || []
          let newExamples: Example[]

          if (editingIndex !== null) {
            // Update existing example
            newExamples = examples.map((ex, idx) =>
              idx === editingIndex ? { text: currentExample.trim(), importance: currentImportance } : ex
            )
          } else {
            // Add new example
            newExamples = [...examples, { text: currentExample.trim(), importance: currentImportance }]
          }

          updatedNode = {
            ...node,
            data: {
              ...node.data,
              examples: newExamples,
              currentInput: ''
            },
          }

          return updatedNode
        }
        return node
      })
    )

    // Update selectedNode to reflect changes
    if (updatedNode) {
      setSelectedNode(updatedNode)
    }

    setCurrentExample('')
    setCurrentImportance('Medium')
    setEditingIndex(null)
  }, [selectedNode, currentExample, currentImportance, editingIndex, setNodes])

  // Edit example from criteria node
  const editExample = useCallback((index: number) => {
    if (!selectedNode || selectedNode.type !== 'criteria') return

    const examples = selectedNode.data.examples || []
    if (index < examples.length) {
      const example = examples[index]
      setCurrentExample(example.text)
      setCurrentImportance(example.importance || 'Medium')
      setEditingIndex(index)

      let updatedNode: CustomNode | null = null

      // Update node to show current input
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            updatedNode = {
              ...node,
              data: {
                ...node.data,
                currentInput: example.text
              },
            }
            return updatedNode
          }
          return node
        })
      )

      // Update selectedNode to reflect changes
      if (updatedNode) {
        setSelectedNode(updatedNode)
      }

      // Focus input
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }, [selectedNode, setNodes])

  // Delete example from criteria node
  const deleteExample = useCallback((index: number) => {
    if (!selectedNode || selectedNode.type !== 'criteria') return

    let updatedNode: CustomNode | null = null

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          const examples = node.data.examples || []
          updatedNode = {
            ...node,
            data: {
              ...node.data,
              examples: examples.filter((_, i) => i !== index)
            },
          }
          return updatedNode
        }
        return node
      })
    )

    // Update selectedNode to reflect changes
    if (updatedNode) {
      setSelectedNode(updatedNode)
    }

    // Reset editing if we're deleting the example being edited
    if (editingIndex === index) {
      setEditingIndex(null)
      setCurrentExample('')
      setCurrentImportance('Medium')
    } else if (editingIndex !== null && editingIndex > index) {
      // Adjust editing index if deleting an item before it
      setEditingIndex(editingIndex - 1)
    }
  }, [selectedNode, editingIndex, setNodes])

  // Add or update exemplar in state node
  const addExemplar = useCallback(() => {
    if (!selectedNode || selectedNode.type !== 'state' || !currentExemplar.trim()) return

    let updatedNode: CustomNode | null = null

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          const exemplars = node.data.exemplars || []
          let newExemplars: string[]

          if (editingExemplarIndex !== null) {
            // Update existing exemplar
            newExemplars = exemplars.map((ex, idx) =>
              idx === editingExemplarIndex ? currentExemplar.trim() : ex
            )
          } else {
            // Add new exemplar
            newExemplars = [...exemplars, currentExemplar.trim()]
          }

          updatedNode = {
            ...node,
            data: {
              ...node.data,
              exemplars: newExemplars
            },
          }

          return updatedNode
        }
        return node
      })
    )

    // Update selectedNode to reflect changes
    if (updatedNode) {
      setSelectedNode(updatedNode)
    }

    setCurrentExemplar('')
    setEditingExemplarIndex(null)
  }, [selectedNode, currentExemplar, editingExemplarIndex, setNodes])

  // Edit exemplar from state node
  const editExemplar = useCallback((index: number) => {
    if (!selectedNode || selectedNode.type !== 'state') return

    const exemplars = selectedNode.data.exemplars || []
    if (index < exemplars.length) {
      const exemplar = exemplars[index]
      setCurrentExemplar(exemplar)
      setEditingExemplarIndex(index)

      // Focus input
      if (exemplarInputRef.current) {
        exemplarInputRef.current.focus()
      }
    }
  }, [selectedNode])

  // Delete exemplar from state node
  const deleteExemplar = useCallback((index: number) => {
    if (!selectedNode || selectedNode.type !== 'state') return

    let updatedNode: CustomNode | null = null

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          const exemplars = node.data.exemplars || []
          updatedNode = {
            ...node,
            data: {
              ...node.data,
              exemplars: exemplars.filter((_, i) => i !== index)
            },
          }
          return updatedNode
        }
        return node
      })
    )

    // Update selectedNode to reflect changes
    if (updatedNode) {
      setSelectedNode(updatedNode)
    }

    // Reset editing if we're deleting the exemplar being edited
    if (editingExemplarIndex === index) {
      setEditingExemplarIndex(null)
      setCurrentExemplar('')
    } else if (editingExemplarIndex !== null && editingExemplarIndex > index) {
      // Adjust editing index if deleting an item before it
      setEditingExemplarIndex(editingExemplarIndex - 1)
    }
  }, [selectedNode, editingExemplarIndex, setNodes])

  // Update state node properties
  const updateStateProperty = useCallback((property: string, value: any) => {
    if (!selectedNode || selectedNode.type !== 'state') return

    let updatedNode: CustomNode | null = null

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          updatedNode = {
            ...node,
            data: {
              ...node.data,
              [property]: value
            },
          }
          return updatedNode
        }
        return node
      })
    )

    // Update selectedNode to reflect changes
    if (updatedNode) {
      setSelectedNode(updatedNode)
    }
  }, [selectedNode, setNodes])

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
        setEdges((eds) => addEdge({
          ...params,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2 }
        }, eds))
      }
    },
    [setEdges, isValidConnection]
  )

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
          ...(newNodeType === 'criteria' ? { examples: [] } : {}),
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
  const addNode = useCallback((type: string) => {
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
      newNode.data.examples = []
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

  const getImportanceColor = (importance: ImportanceLevel): string => {
    switch (importance) {
      case 'Very High': return 'bg-red-600 text-white'
      case 'High': return 'bg-orange-500 text-white'
      case 'Medium': return 'bg-yellow-400 text-black'
      case 'Low': return 'bg-blue-400 text-white'
      case 'Very Low': return 'bg-gray-400 text-white'
      default: return 'bg-yellow-400 text-black'
    }
  }


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
    <div className="w-full h-screen flex flex-col">
      {/* Top Controls */}
      <div className="bg-gray-800 text-white p-4 flex gap-4 items-center shadow-lg">
        <h1 className="text-xl font-bold mr-4">Workflow Builder</h1>
        <button
          onClick={() => addNode('state')}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded font-semibold transition"
        >
          + State (Shift+Alt+S)
        </button>
        <button
          onClick={() => addNode('criteria')}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded font-semibold transition"
        >
          + Criteria (Shift+Alt+C)
        </button>
        <button
          onClick={() => addNode('end')}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded font-semibold transition"
        >
          + End (Shift+Alt+E)
        </button>
      </div>

      {/* Edit Panel */}
      {selectedNode && (
        <div className="absolute top-20 right-4 bg-white shadow-xl rounded-lg p-4 z-10 border-2 border-gray-300 w-[500px] max-h-[calc(100vh-6rem)] overflow-y-auto">
          <h3 className="font-bold text-lg mb-3">Edit {selectedNode.type ? selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1) : 'Node'}</h3>
          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1">Name:</label>
            {selectedNode.type !== 'end' && selectedNode.type !== 'start' &&
              <input
                type="text"
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value)
                  updateNodeLabel(e.target.value)
                }}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
            }
          </div>

          {selectedNode.type === 'state' && (
            <>
              <div className="mb-3">
                <label className="block text-sm font-semibold mb-1">Personality Profile:</label>
                <select
                  value={(selectedNode.data as StateNodeData).personality || 'Neutral'}
                  onChange={(e) => updateStateProperty('personality', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Angry">Angry</option>
                  <option value="Annoyed">Annoyed</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Content">Content</option>
                  <option value="Happy">Happy</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-semibold mb-1">Context:</label>
                <textarea
                  value={(selectedNode.data as StateNodeData).context || ''}
                  onChange={(e) => updateStateProperty('context', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  placeholder="Enter context..."
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-semibold mb-1">Number of Retries:</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={(selectedNode.data as StateNodeData).retryCount || 1}
                  onChange={(e) => {
                    const value = Math.min(5, Math.max(1, parseInt(e.target.value) || 1))
                    updateStateProperty('retryCount', value)
                  }}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-semibold mb-2">List Exemplar:</label>

                {/* Input field for new exemplar */}
                <div className="mb-3 space-y-2">
                  <input
                    ref={exemplarInputRef}
                    type="text"
                    value={currentExemplar}
                    onChange={(e) => setCurrentExemplar(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addExemplar()
                      } else if (e.key === 'Escape') {
                        e.preventDefault()
                        setCurrentExemplar('')
                        setEditingExemplarIndex(null)
                        if (exemplarInputRef.current) {
                          exemplarInputRef.current.blur()
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={editingExemplarIndex !== null ? "Edit exemplar..." : "Type exemplar..."}
                  />

                  <button
                    onClick={addExemplar}
                    disabled={!currentExemplar.trim()}
                    className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingExemplarIndex !== null ? 'Update Exemplar' : 'Add Exemplar'}
                  </button>
                </div>

                {editingExemplarIndex !== null && (
                  <div className="mb-2 text-xs text-blue-600 font-semibold">
                    Editing exemplar {editingExemplarIndex + 1} • Press Esc to cancel
                  </div>
                )}

                {/* List of exemplars */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {((selectedNode.data as StateNodeData).exemplars || []).map((exemplar, index) => (
                    <div key={index} className={`flex items-start gap-2 px-3 py-2 rounded border transition-all ${editingExemplarIndex === index
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                      : 'bg-gray-50 border-gray-200'
                      }`}>
                      <div className="flex-1 text-sm break-words whitespace-normal">{exemplar}</div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => editExemplar(index)}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold transition"
                          title="Edit exemplar"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteExemplar(index)}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition"
                          title="Delete exemplar"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedNode.type === 'criteria' && (
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-2">Examples:</label>

              {/* Input field for new example */}
              <div className="mb-3 space-y-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentExample}
                  onChange={(e) => updateCurrentExample(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addExample()
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      setCurrentExample('')
                      setCurrentImportance('Medium')
                      setEditingIndex(null)
                      if (inputRef.current) {
                        inputRef.current.blur()
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder={editingIndex !== null ? "Edit example..." : "Type example..."}
                />

                <div className="flex gap-2 items-center">
                  <label className="text-sm font-medium">Importance:</label>
                  <select
                    value={currentImportance}
                    onChange={(e) => setCurrentImportance(e.target.value as ImportanceLevel)}
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="Very Low">Very Low</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </div>

                <button
                  onClick={addExample}
                  disabled={!currentExample.trim()}
                  className="w-full px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingIndex !== null ? 'Update Example' : 'Add Example'}
                </button>
              </div>

              {editingIndex !== null && (
                <div className="mb-2 text-xs text-blue-600 font-semibold">
                  Editing example {editingIndex + 1} • Press Esc to cancel
                </div>
              )}

              {/* List of examples */}
              <div className="space-y-2 max-h-68 overflow-y-auto">
                {(selectedNode.data.examples || []).map((example, index) => (
                  <div key={index} className={`flex items-start gap-2 px-1.5 py-1 rounded border transition-all ${editingIndex === index
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                    : 'bg-yellow-50 border-yellow-200'
                    }`}>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <span className={`inline-block text-xs px-1 rounded font-semibold ${getImportanceColor(example.importance)}`}>
                        {example.importance}
                      </span>
                      <div className="text-sm break-words whitespace-normal">{example.text}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => editExample(index)}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold transition"
                        title="Edit example"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteExample(index)}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition"
                        title="Delete example"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setSelectedNode(null)}
            className="w-full px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-semibold transition"
          >
            Close
          </button>
        </div>
      )}

      {/* React Flow Canvas */}
      <div className="flex-1">
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
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  )
}