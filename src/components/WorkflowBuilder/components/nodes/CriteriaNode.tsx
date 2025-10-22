import { memo } from "react"
import { CriteriaNodeData, ImportanceLevel } from "../../type"
import { Handle, Position } from "@xyflow/react"

const CriteriaNode = memo(function CriteriaNode({ data, id }: { data: CriteriaNodeData; id: string }) {
    const examples = data.examples || []
    const currentInput = data.currentInput || ''
    const isSelected = data.selected

    const getImportanceColor = (importance: ImportanceLevel): string => {
        switch (importance) {
            case 'Very High': return 'bg-red-600 text-white'
            case 'High': return 'bg-orange-500 text-white'
            case 'Medium': return 'bg-yellow-400 text-black'
            case 'Low': return 'bg-blue-400 text-white'
            case 'Very Low': return 'bg-gray-400 text-white'
            default: return 'bg-yellow-400 text-black'
        }
    }

    return (
        <div className={`shadow-lg rounded-lg bg-yellow-100 border-2 text-gray-900 min-w-[240px] max-w-[500px] transition-all border-yellow-300
            ${isSelected ? 'shadow-2xl ring-4 ring-yellow-300' : ''}`}>
            <div className={`w-full px-4 py-2 text-center font-semibold ${examples.length > 0 || currentInput ? 'border-b-2' : ''} border-yellow-300`}>
                {data.label}
            </div>
            {(examples.length > 0 || currentInput) &&
                <div className="w-full p-2 space-y-1.5">
                    {examples.map((ex, idx) => (
                        <div key={idx} className={`relative py-1 px-2 text-sm rounded-md ${getImportanceColor(ex.importance)}`}>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`example-${idx}`}
                                className="!w-3 !h-3 !bg-emerald-500 !-mr-2.5"
                            />
                            {ex.text}
                        </div>
                    ))}
                    {currentInput && (
                        <div className="relative py-1 px-2 text-sm italic border border-amber-600">
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`example-preview`}
                                className="!w-3 !h-3 !bg-emerald-500 !-mr-2.5"
                                style={{ opacity: 0 }}
                            />
                            {currentInput}
                        </div>
                    )}
                </div>
            }
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-blue-500 ml-[-1px]"
            />
        </div>
    )
})

export default CriteriaNode;