import { memo } from "react"
import { StateNodeData } from "../../type"
import { Handle, Position } from "@xyflow/react"

const StateNode = memo(function StateNode({ data, id }: { data: StateNodeData; id: string }) {
    const isSelected = data.selected
    return (
        <div className={`px-6 py-3 shadow-lg rounded-lg bg-blue-100 border-2 border-blue-300 text-black min-w-[120px] transition-all
            ${isSelected ? 'shadow-2xl ring-4 ring-blue-300' : ''}`}>
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-blue-500"
            />
            <div className="text-center font-semibold">{data.label}</div>
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !bg-emerald-500"
            />
        </div>
    )
})

export default StateNode;