'use client'

import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useWorkflow, WorkflowContextProvider } from './context/WorkflowContextProvider'
import StateFlowBuilder from './components/StateFlowBuilder'
import { memo, useEffect } from 'react'
import WorkFlowPreview from './components/WorkFlowPreview'


const WorkflowBuilderInner = memo(function WorkflowBuilderInner() {
	const { isSetAnimationModeOn, setIsSetAnimationModeOn } = useWorkflow();

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.shiftKey && event.ctrlKey) {
				switch (event.key.toLowerCase()) {
					case 'f':
						event.preventDefault()
						setIsSetAnimationModeOn(prev => !prev)
						break
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [setIsSetAnimationModeOn])

	return isSetAnimationModeOn ? <WorkFlowPreview /> : <StateFlowBuilder />
});


export default function WorkflowBuilder() {
	return (
		<WorkflowContextProvider>
			<ReactFlowProvider>
				<WorkflowBuilderInner />
			</ReactFlowProvider>
		</WorkflowContextProvider>
	)
}