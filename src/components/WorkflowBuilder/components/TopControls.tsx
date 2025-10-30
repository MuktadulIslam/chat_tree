import { memo } from "react";
import { NodeType } from "../type";
import { useWorkflow } from "../context/WorkflowContextProvider";

const TopControls = memo(function TopControls({ addNode }: { addNode: (type: NodeType) => void }) {
    const { changeExamFlowFiewMode } = useWorkflow();
    
    return (
        <div className="bg-gray-800 text-white p-4 flex gap-4 items-center shadow-lg">
            <h1 className="text-xl font-bold mr-4">Workflow Builder</h1>
            <button
                onClick={() => addNode('state')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded font-semibold transition"
            >
                + State (Shift+Alt+S)
            </button>
            <button
                onClick={() => addNode('criteria')}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded font-semibold transition"
            >
                + Criteria (Shift+Alt+C)
            </button>
            <button
                onClick={() => addNode('end')}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded font-semibold transition"
            >
                + End (Shift+Alt+E)
            </button>
            <button
                onClick={() => changeExamFlowFiewMode()}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded font-semibold transition"
            >
                Add Animation
            </button>
            <div className="ml-auto text-sm text-gray-300">
                💡 Tip: Select a node and press <kbd className="px-2 py-1 bg-gray-700 rounded">Shift+Alt+D</kbd> to duplicate
            </div>
        </div>
    );
});

export default TopControls;