import { memo } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

import StateAnimationsRoadMapPreview from "./StateAnimationsRoadMapPreview";
import AllStatePreview from "./AllStatePreview";
import { TiArrowRightOutline } from "react-icons/ti";
import AddStateAnimation from "./AddStateAnimation";

const StateAnimationsBuilder = memo(function StateAnimations() {
    return (
        <div className="w-full h-full flex flex-col gap-1 p-1">
            <PanelGroup direction="vertical">
                <Panel defaultSize={60} minSize={10} className="h-full">
                    <div className="w-full h-full pb-2 flex">
                        <div className="w-full h-full flex items-center shrink">
                            <AllStatePreview />
                            <div className="w-12 h-12 flex justify-center items-center">
                                < TiArrowRightOutline size={45} className="text-gray-700" />
                            </div>
                        </div>
                        <StateAnimationsRoadMapPreview />
                    </div>
                </Panel>
                
                <PanelResizeHandle className="h-0.5 bg-gray-600 hover:bg-blue-600 transition-colors cursor-row-resize" />

                <Panel defaultSize={40} minSize={5}>
                    <AddStateAnimation />
                </Panel>
            </PanelGroup>
        </div>
    );
});

export default StateAnimationsBuilder;