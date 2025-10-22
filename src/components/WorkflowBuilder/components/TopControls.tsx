import { memo } from "react";
import { NodeType } from "../type";

const TopControls = memo(function TopControls({ addNode }: { addNode: (type: NodeType) => void }) {
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
        </div>
    );
});

export default TopControls;