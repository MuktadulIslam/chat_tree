import { memo } from "react";
import { useWorkflow } from "../context/WorkflowContextProvider";

const StateAnimations = memo(function StateAnimations() {
    const { setIsSetAnimationModeOn } = useWorkflow();

    return (
        <div className="w-full h-full flex flex-col gap-2 items-center justify-center bg-red-400">
            <h1 className="text-2xl font-bold">State Animations Placeholder</h1>
            <button
                onClick={() => setIsSetAnimationModeOn(false)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition"
            >
                Add Animation
            </button>

        </div>
    );
});

export default StateAnimations;