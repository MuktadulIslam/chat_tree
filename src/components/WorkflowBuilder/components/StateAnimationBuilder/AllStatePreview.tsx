import { memo } from "react";
import AnimationTags from "./AnimationTags";
import { State } from "../../type/stateAnimationBuilderDataType";
import { useStateAnimationBuilder } from "../../context/StateAnimationBuilderContextProvider";


// State Content Component
const StateContent = memo(function StateContent({ state }: { state: State }) {
    const getPersonalityStyle = (type: State['personality']) => {
        const styles = {
            'Angry': 'text-red-800',
            'Annoyed': 'text-orange-800',
            'Neutral': 'text-gray-800',
            'Content': 'text-blue-800',
            'Happy': 'text-green-800'
        };
        return styles[type];
    };

    return (
        <div className={`w-full h-auto p-2 rounded-xl ring hover:ring-2 hover:shadow-md flex items-start justify-between
        ${state.state_type == 'end' ? 'bg-red-50 ring-red-300 hover:ring-red-600' : 'bg-blue-50 ring-blue-300 hover:ring-blue-600'}
        `}>
            <div className="flex-1 min-w-0">
                {/* Workflow Title and Order */}
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-800 truncate line-clamp-1 leading-5">
                        {state.name}
                    </h3>
                </div>

                <p className={`${getPersonalityStyle(state.personality)} text-xs font-extrabold line-clamp-1`}>
                    Personality:
                    <i className="ml-1">{state.personality}</i>
                </p>

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
})

const AllStatePreview = memo(function AllStatePreview() {
    const { states } = useStateAnimationBuilder();

    return (
        <div className="w-full h-full bg-white rounded-2xl border shadow-lg flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900 p-2 border-b-2">State flows ({2})</h3>
            <div className="h-full overflow-y-auto overflow-x-hidden p-2 space-y-2">
                {states.map((state, index) =>
                    <StateContent state={state} key={index} />
                )}
            </div>
        </div>
    )
})

export default AllStatePreview;