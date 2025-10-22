import { memo, useEffect } from "react"
import { CriteriaNodeData } from "../../type"
import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react"

const CriteriaNode = memo(function CriteriaNode({ data, id }: { data: CriteriaNodeData; id: string }) {
    const subCriterias = data.subCriterias || []
    const currentSubCriteriaInput = data.currentSubCriteriaInput || ''
    const isSelected = data.selected
    const updateNodeInternals = useUpdateNodeInternals()

    // Update node internals when subCriterias change
    useEffect(() => {
        updateNodeInternals(id)
    }, [subCriterias.length, currentSubCriteriaInput, id, updateNodeInternals])

    return (
        <div className={`shadow-lg rounded-lg bg-yellow-200 border-2 text-gray-900 min-w-[240px] max-w-[500px] transition-all border-yellow-300
            ${isSelected ? 'shadow-2xl ring-4 ring-yellow-300' : ''}`}>
            {/* Main Criteria Header */}
            <div className={`w-full h-12 px-4 font-bold text-lg flex justify-center items-center ${(subCriterias.length > 0 || currentSubCriteriaInput) ? 'border-b-2' : ''} border-yellow-400`}>
                {data.label}
            </div>

            {/* Sub-Criteria List (Names Only with Handles) */}
            {(subCriterias.length > 0 || currentSubCriteriaInput) && (
                <div className="w-full p-2 space-y-1.5 bg-yellow-100 rounded-b-lg">
                    {subCriterias.map((subCriteria, index) => (
                        <div key={subCriteria.id} className="relative py-2 px-3 text-sm font-semibold rounded-md bg-yellow-50 border-2 border-yellow-300">
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`sub-${subCriteria.id}`}
                                className="!w-3 !h-3 !bg-emerald-500 !mr-0.5"
                            />
                            {subCriteria.name}
                            <span className="ml-1 text-xs text-gray-600">
                                ({subCriteria.examples.length} i.e)
                            </span>
                        </div>
                    ))}
                    {currentSubCriteriaInput && (
                        <div className="relative py-2 px-3 text-sm font-semibold italic border-2 border-dashed border-amber-600 rounded-md bg-yellow-50">
                            {currentSubCriteriaInput}
                        </div>
                    )}
                </div>
            )}

            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-blue-500 !-mr-2.5"
            />
        </div>
    )
})

export default CriteriaNode;