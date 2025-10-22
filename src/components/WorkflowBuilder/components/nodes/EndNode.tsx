import { memo } from "react"
import { EndNodeData } from "../../type"
import { Handle, Position } from "@xyflow/react"

const EndNode = memo(function EndNode({ data }: { data: EndNodeData }) {
    const isSelected = data.selected
    return (
        <div className={`px-6 py-3 shadow-lg rounded-lg bg-red-200 border-2 border-red-400 text-black font-bold transition-all
            ${isSelected ? 'shadow-2xl ring-4 ring-red-400' : ''}`}>
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-blue-500"
            />
            <div>END</div>
        </div>
    )
})

export default EndNode;