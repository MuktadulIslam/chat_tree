'use client'

import '@xyflow/react/dist/style.css'
import { memo, useEffect } from 'react'

import WorkflowContextProvider, { useWorkflow } from './context/WorkflowContextProvider'
import RoomContextProvider from './context/RoomContextProvider'
import StateAnimationBuilderContextProvider from './context/StateAnimationBuilderContextProvider'
import StateFlowBuilder from './components/StateFlowBuilder'
import WorkFlowPreview from './components/WorkFlowPreview'


const WorkflowBuilderInner = memo(function WorkflowBuilderInner() {
	const { isSetAnimationModeOn, changeExamFlowFiewMode, nodes} = useWorkflow();

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.shiftKey && event.ctrlKey) {
				switch (event.key.toLowerCase()) {
					case 'f':
						event.preventDefault();
						changeExamFlowFiewMode();
						break;
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [changeExamFlowFiewMode, nodes])

	return (
		isSetAnimationModeOn ? <WorkFlowPreview /> : <StateFlowBuilder />
	)
});


export default function WorkflowBuilder() {
	return (
		<RoomContextProvider>
			<StateAnimationBuilderContextProvider>
				<WorkflowContextProvider>
					<WorkflowBuilderInner />
				</WorkflowContextProvider>
			</StateAnimationBuilderContextProvider>
		</RoomContextProvider>
	)
}