import { memo } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import StateFlowPreview from "./StateFlowPreview"
import StateAnimations from "./StateAnimations"
import RoomStructureView from "./RoomStructureView"

const WorkFlowPreview = memo(function WorkFlowPreview() {
    return (
        <div className='w-full h-full'>
            <PanelGroup direction="horizontal">
                {/* Left side - vertically split panels */}
                <Panel defaultSize={60} minSize={30}>
                    <PanelGroup direction="vertical">
                        <Panel defaultSize={50} minSize={10}>
                            <div className="w-full h-full border-2 border-gray-400">
                                <StateFlowPreview />
                            </div>
                        </Panel>
                        
                        <PanelResizeHandle className="h-1 bg-gray-300 hover:bg-blue-400 transition-colors cursor-row-resize" />
                        
                        <Panel defaultSize={50} minSize={10}>
                            <div className="w-full h-full border-2 border-gray-400">
                                <RoomStructureView />
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
                
                <PanelResizeHandle className="w-1 bg-gray-300 hover:bg-blue-400 transition-colors cursor-col-resize" />
                
                {/* Right side panel */}
                <Panel defaultSize={40} minSize={10}>
                    <div className="w-full h-full p-0.5">
                        <StateAnimations />
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    )
})

export default WorkFlowPreview