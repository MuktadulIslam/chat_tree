import { memo, useCallback } from "react";
import AnimationTags from "./AnimationTags";
import { State } from "../../type/stateAnimationBuilderDataType";
import { useStateAnimationBuilder } from "../../context/StateAnimationBuilderContextProvider";
import { useWorkflow } from "../../context/WorkflowContextProvider";
import PersonalityStyleComponent from "./PersonalityStyleComponent";


// State Content Component
const StateContent = memo(function StateContent({
    state,
    isSelected
}: {
    state: State;
    isSelected: boolean;
}) {
    const { nodes } = useWorkflow();
    const { selectedStatesForAnimation, setSelectedStatesForAnimation } = useStateAnimationBuilder();

    // Handle state click to select/deselect for animation
    const handleStateClick = useCallback(() => {
        // If clicking the same state again, deselect it
        if (selectedStatesForAnimation?.id === state.id) {
            setSelectedStatesForAnimation(null);
            return;
        }
        setSelectedStatesForAnimation(state);
    }, [state.id, nodes, selectedStatesForAnimation, setSelectedStatesForAnimation]);

    return (
        <div
            onClick={handleStateClick}
            className={`w-full h-auto p-2 rounded-lg flex items-start justify-between cursor-pointer transition-all
            ${state.state_type === 'end'
                    ? 'bg-red-50 ring-red-300 hover:ring-red-600'
                    : 'bg-blue-50 ring-blue-300 hover:ring-blue-600'
                }
            ${isSelected
                    ? `ring-4 shadow-md ${state.state_type === 'end' ? 'ring-red-600' : 'ring-blue-600'}`
                    : 'ring hover:ring-4 hover:shadow-md'
                }
        `}>
            <div className="flex-1 min-w-0">
                {/* Workflow Title and Order */}
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-800 truncate line-clamp-1 leading-5">
                        {state.name}
                    </h3>
                    {isSelected && (
                        <span className="text-xs font-bold px-2 py-0.5 bg-blue-600 text-white rounded-full animate-pulse">
                            SELECTED
                        </span>
                    )}
                </div>

                <PersonalityStyleComponent personality={state.personality} />

                {/* Workflow Description */}
                <p className="text-gray-600 text-sm line-clamp-2 mb-1">
                    {state.context}
                </p>
                {/* Animation Types */}
                <div className="">
                    <AnimationTags types={state.animation_types} />
                </div>
            </div>
        </div>
    );
});

const AllStatePreview = memo(function AllStatePreview() {
    const { states, selectedStatesForAnimation } = useStateAnimationBuilder();
    return (
        <div className="w-full h-full bg-white rounded-2xl border shadow-lg flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900 p-2 border-b-2">
                State flows ({states.length})
                <span className="text-sm font-normal text-gray-600 ml-2">
                    • Click to select • Click again to deselect
                </span>
            </h3>
            <div className="h-full overflow-y-auto overflow-x-hidden p-2 space-y-2">
                {states.map((state, index) => (
                    <StateContent
                        state={state}
                        key={index}
                        isSelected={selectedStatesForAnimation?.id === state.id}
                    />
                ))}
                {states.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <p className="text-lg font-semibold">No States Available</p>
                            <p className="text-sm">States will appear here once you enable animations on nodes</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default AllStatePreview;