import { memo } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { LuSquareArrowLeft } from "react-icons/lu";

import StateFlowPreview from "./StateFlowPreview"
import RoomStructureView from "./RoomStructureView"
import StateAnimationsBuilder from "./StateAnimationBuilder"
import { useWorkflow } from "../context/WorkflowContextProvider";

const WorkFlowPreview = memo(function WorkFlowPreview() {
    const { changeExamFlowFiewMode } = useWorkflow();

    return (
        <div className='w-full h-full relative'>
            <button className="w-12 aspect-square absolute top-2 left-2 z-50 bg-white text-black cursor-pointer"
                onClick={() => changeExamFlowFiewMode()}
            >
                <LuSquareArrowLeft size={40} />
            </button>

            <PanelGroup direction="horizontal">
                {/* Left side - vertically split panels */}
                <Panel defaultSize={55} minSize={30}>
                    <PanelGroup direction="vertical">
                        <Panel defaultSize={50} minSize={10}>
                            <div className="w-full h-full border-2 border-gray-400">
                                <StateFlowPreview />
                            </div>
                        </Panel>

                        <PanelResizeHandle className="h-0.5 bg-gray-600 hover:bg-blue-600 transition-colors cursor-row-resize" />

                        <Panel defaultSize={50} minSize={10}>
                            <div className="w-full h-full border-2 border-gray-400">
                                <RoomStructureView />
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>

                <PanelResizeHandle className="w-0.5 bg-gray-600 hover:bg-blue-600 transition-colors cursor-col-resize" />

                {/* Right side panel */}
                <Panel defaultSize={45} minSize={10}>
                    <div className="w-full h-full p-0.5">
                        <StateAnimationsBuilder />
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    )
})

export default WorkFlowPreview