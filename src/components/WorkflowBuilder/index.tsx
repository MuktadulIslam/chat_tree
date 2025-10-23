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
	NodeChange,
	FinalConnectionState
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CustomNode, NodeData, NodeType, nodeTypes } from './type'
import { WorkflowContextProvider, useWorkflow } from './context/WorkflowContextProvider'
import EditPanel from './components/EditPanel'
import TopControls from './components/TopControls'



function WorkflowBuilderInner() {
	const { nodes, edges, onNodesChange, onEdgesChange, setNodes, setEdges, selectedNode, setSelectedNode } = useWorkflow();

	const nodeIdCounter = useRef<number>(1);
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
	}, [setNodes, setSelectedNode])

	// Handle pane click to deselect
	const onPaneClick = useCallback(() => {
		setSelectedNode(null)
		setNodes((nds) =>
			nds.map((n) => ({
				...n,
				data: { ...n.data, selected: false, currentInput: '' }
			}))
		)
	}, [setNodes, setSelectedNode])


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


	const onConnectEnd = useCallback((event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
		if (!connectionState.fromNode) return;

		let newNode: CustomNode | null = null;
		if (!connectionState.toNode) {
			// Check if Start node already has an outgoing edge
			if (connectionState.fromNode.type === 'start') {
				const hasOutgoingEdge = edges.some(edge => edge.source === connectionState.fromNode?.data.id)
				if (hasOutgoingEdge) {
					return
				}
			}

			// Determine what type of node to create based on source
			let newNodeType: NodeType | null = null;
			if (connectionState.fromNode.type === 'state') {
				newNodeType = 'criteria';
			}
			else if (connectionState.fromNode.type === 'criteria' || connectionState.fromNode.type === 'start') {
				newNodeType = 'state';
			}
			if (!newNodeType) {
				return;
			}

			const position = {
				x: connectionState.to?.x ?? Math.random() * 400 + 200,
				y: connectionState.to?.y ?? Math.random() * 300 + 100
			};
			const flowPosition = screenToFlowPosition(position);
			newNode = addNode(newNodeType, flowPosition);
		}


		if (!newNode) return;
		// Create edge from source to new node
		const newEdge: Edge = {
			id: `e-${connectionState.fromNode.id}-${Date.now().toString()}`,
			source: connectionState.fromNode.id,
			sourceHandle: connectionState.fromHandle?.id || null,
			target: newNode.id,
			markerEnd: { type: MarkerType.ArrowClosed },
			style: { strokeWidth: 2 }
		}
		setEdges((eds) => [...eds, newEdge]);
	},
		[nodes, edges, setNodes, setEdges, screenToFlowPosition]
	)

	// Add nodes
	const addNode = useCallback((type: NodeType, position?: { x: number; y: number }): CustomNode => {
		nodeIdCounter.current += 1
		const id = `${type}-${nodeIdCounter.current}`

		let newNode: CustomNode = {
			id,
			type,
			position: position || {
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
		} else if (type === 'end') {
			newNode.data = {
				...newNode.data,
				label: 'END',
				personality: 'Neutral',
				context: ''
			}
		}

		setNodes((nds) => [...nds, newNode]);
		return newNode;
	}, [setNodes])

	// Duplicate selected node
	const duplicateNode = useCallback(() => {
		if (!selectedNode || selectedNode.type === 'start') return;

		nodeIdCounter.current += 1;
		const newId = `${selectedNode.type}-${nodeIdCounter.current}`;

		// Deep clone the node data
		const clonedData = JSON.parse(JSON.stringify(selectedNode.data));
		
		// Remove selection state from cloned data
		delete clonedData.selected;
		delete clonedData.currentInput;
		delete clonedData.currentSubCriteriaInput;

		const newNode: CustomNode = {
			id: newId,
			type: selectedNode.type,
			position: {
				x: selectedNode.position.x + 50,
				y: selectedNode.position.y + 50
			},
			data: clonedData
		};

		setNodes((nds) => [...nds, newNode]);

		// Select the newly created node
		setSelectedNode(newNode);
		setNodes((nds) =>
			nds.map((n) => ({
				...n,
				data: { ...n.data, selected: n.id === newId }
			}))
		);
	}, [selectedNode, setNodes, setSelectedNode]);

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
					case 'd':
						event.preventDefault()
						duplicateNode()
						break
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [addNode, duplicateNode])



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
		[onNodesChange, selectedNode, onPaneClick]
	);

	return (
		<div className="w-full h-screen flex flex-col relative">
			<TopControls addNode={addNode} />
			<EditPanel />

			{/* React Flow Canvas */}
			<div className="flex-1 w-full h-full">
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={handleNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
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