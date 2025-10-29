'use client'

import '@xyflow/react/dist/style.css'
import WorkflowContextProvider, { useWorkflow } from './context/WorkflowContextProvider'
import RoomContextProvider from './context/RoomContextProvider'
import StateAnimationBuilderContextProvider, { useStateAnimationBuilder } from './context/StateAnimationBuilderContextProvider'

import StateFlowBuilder from './components/StateFlowBuilder'
import WorkFlowPreview from './components/WorkFlowPreview'
import { memo, useCallback, useEffect } from 'react'
import { AnimationType, State } from './type/stateAnimationBuilderDataType'
import { EndNodeData, StateNodeData } from './type'


const WorkflowBuilderInner = memo(function WorkflowBuilderInner() {
	const { isSetAnimationModeOn, setIsSetAnimationModeOn, nodes, edges } = useWorkflow();
	const { setStates } = useStateAnimationBuilder();

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

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.shiftKey && event.ctrlKey) {
				switch (event.key.toLowerCase()) {
					case 'f':
						event.preventDefault();
						if (!isSetAnimationModeOn) setStatesForAnimations();
						setIsSetAnimationModeOn(prev => !prev);
						break;
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [setIsSetAnimationModeOn, setStatesForAnimations, isSetAnimationModeOn, nodes])

	return (
		isSetAnimationModeOn ? <WorkFlowPreview /> : <StateFlowBuilder />
	)
});


export default function WorkflowBuilder() {
	return (
		<RoomContextProvider>
			<WorkflowContextProvider>
				<StateAnimationBuilderContextProvider>
					<WorkflowBuilderInner />
				</StateAnimationBuilderContextProvider>
			</WorkflowContextProvider>
		</RoomContextProvider>
	)
}