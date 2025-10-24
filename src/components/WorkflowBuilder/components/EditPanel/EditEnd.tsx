'use client';
import { memo, useCallback } from "react";
import { useWorkflow } from "../../context/WorkflowContextProvider";
import { EndNodeData } from "../../type";

const EditEnd = memo(function EditEnd() {
    const { setNodes, selectedNode, nodes } = useWorkflow();

    // Get current node data (to avoid stale state)
    const currentNode = nodes.find(n => n.id === selectedNode?.id);

    // Update end node properties
    const updateEndProperty = useCallback((property: string, value: string) => {
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

    // Update animation type checkbox
    const updateAnimationType = useCallback((animationType: 'pre' | 'during' | 'post', value: boolean) => {
        if (!currentNode || currentNode.type !== 'end') return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === currentNode.id) {
                    const currentAnimations = node.data.animations_type_has || { pre: false, during: false, post: false };
                    const updatedNode = {
                        ...node,
                        data: {
                            ...node.data,
                            animations_type_has: {
                                ...currentAnimations,
                                [animationType]: value
                            }
                        },
                    }
                    return updatedNode
                }
                return node
            })
        )
    }, [currentNode, setNodes]);

    const animationsTypeHas = (currentNode?.data as EndNodeData)?.animations_type_has || { pre: false, during: false, post: false };

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

            <div className="mb-3">
                <label className="block text-sm font-semibold mb-2">Animations Type:</label>
                <div className="flex gap-1 bg-red-50 rounded-lg border border-red-200">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-red-100 p-2 rounded transition">
                        <input
                            type="checkbox"
                            checked={animationsTypeHas.pre}
                            onChange={(e) => updateAnimationType('pre', e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                        />
                        <span className="text-sm font-medium">Pre Animations</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-red-100 p-2 rounded transition">
                        <input
                            type="checkbox"
                            checked={animationsTypeHas.during}
                            onChange={(e) => updateAnimationType('during', e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                        />
                        <span className="text-sm font-medium">During Animations</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-red-100 p-2 rounded transition">
                        <input
                            type="checkbox"
                            checked={animationsTypeHas.post}
                            onChange={(e) => updateAnimationType('post', e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                        />
                        <span className="text-sm font-medium">Post Animations</span>
                    </label>
                </div>
            </div>
        </div>
    )
});

export default EditEnd;