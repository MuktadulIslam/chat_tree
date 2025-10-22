'use client';
import { memo, useCallback } from "react";
import { useWorkflow } from "../../context/WorkflowContextProvider";
import { EndNodeData } from "../../type";

const EditEnd = memo(function EditEnd() {
    const { setNodes, selectedNode, nodes } = useWorkflow();

    // Get current node data (to avoid stale state)
    const currentNode = nodes.find(n => n.id === selectedNode?.id);

    // Update end node properties
    const updateEndProperty = useCallback((property: string, value: any) => {
        if (!currentNode || currentNode.type !== 'end') return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === currentNode.id) {
                    const updatedNode = {
                        ...node,
                        data: {
                            ...node.data,
                            [property]: value
                        },
                    }
                    return updatedNode
                }
                return node
            })
        )
    }, [currentNode, setNodes]);

    return (
        <div>
            <div className="mb-3">
                <label className="block text-sm font-semibold mb-1">Personality Profile:</label>
                <select
                    value={(currentNode?.data as EndNodeData).personality || 'Neutral'}
                    onChange={(e) => updateEndProperty('personality', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="Angry">Angry</option>
                    <option value="Annoyed">Annoyed</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Content">Content</option>
                    <option value="Happy">Happy</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="block text-sm font-semibold mb-1">Context:</label>
                <textarea
                    value={(currentNode?.data as EndNodeData).context || ''}
                    onChange={(e) => updateEndProperty('context', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
                    placeholder="Enter context..."
                />
            </div>
        </div>
    )
});

export default EditEnd;