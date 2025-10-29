import { memo } from "react"
import { Handle, Position } from "@xyflow/react"

const StartNode = memo(function StartNode() {
    return (
        <div className="px-6 py-3 shadow-lg rounded-lg bg-green-200 border-2 border-green-500 text-black font-bold text-base">
            <div>START</div>
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !bg-emerald-500"
            />
        </div>
    )
})

export default StartNode;