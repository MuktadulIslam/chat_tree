'use client';
import { memo, useCallback, useRef, useState } from "react";
import { useWorkflow } from "../../context/WorkflowContextProvider";
import { StateNodeData } from "../../type";

const EditState = memo(function EditState() {
    const { setNodes, selectedNode, nodes } = useWorkflow();

    const exemplarInputRef = useRef<HTMLInputElement>(null);
    const [currentExemplar, setCurrentExemplar] = useState<string>('');
    const [editingExemplarIndex, setEditingExemplarIndex] = useState<number | null>(null)

    // Get current node data (to avoid stale state)
    const currentNode = nodes.find(n => n.id === selectedNode?.id);

    // Update state node properties
    const updateStateProperty = useCallback((property: string, value: string | number) => {
        if (!currentNode || currentNode.type !== 'state') return;

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
        if (!currentNode || currentNode.type !== 'state') return;

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

    const addExemplar = useCallback(() => {
        if (!currentNode || currentNode.type !== 'state' || !currentExemplar.trim()) return

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === currentNode.id) {
                    const exemplars = node.data.exemplars || []
                    let newExemplars: string[]

                    if (editingExemplarIndex !== null) {
                        // Update existing exemplar
                        newExemplars = exemplars.map((ex, idx) =>
                            idx === editingExemplarIndex ? currentExemplar.trim() : ex
                        )
                    } else {
                        // Add new exemplar
                        newExemplars = [...exemplars, currentExemplar.trim()]
                    }

                    const updatedNode = {
                        ...node,
                        data: {
                            ...node.data,
                            exemplars: newExemplars
                        },
                    }

                    return updatedNode
                }
                return node
            })
        )

        setCurrentExemplar('')
        setEditingExemplarIndex(null)
    }, [currentNode, currentExemplar, editingExemplarIndex, setNodes]);

    const editExemplar = useCallback((index: number) => {
        if (!currentNode || currentNode.type !== 'state') return

        const exemplars = currentNode.data.exemplars || []
        if (index < exemplars.length) {
            const exemplar = exemplars[index]
            setCurrentExemplar(exemplar)
            setEditingExemplarIndex(index)

            // Focus input
            if (exemplarInputRef.current) {
                exemplarInputRef.current.focus()
            }
        }
    }, [currentNode])

    // Delete exemplar from state node
    const deleteExemplar = useCallback((index: number) => {
        if (!currentNode || currentNode.type !== 'state') return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === currentNode.id) {
                    const exemplars = node.data.exemplars || []
                    const updatedNode = {
                        ...node,
                        data: {
                            ...node.data,
                            exemplars: exemplars.filter((_, i) => i !== index)
                        },
                    }
                    return updatedNode
                }
                return node
            })
        )

        // Reset editing if we're deleting the exemplar being edited
        if (editingExemplarIndex === index) {
            setEditingExemplarIndex(null)
            setCurrentExemplar('')
        } else if (editingExemplarIndex !== null && editingExemplarIndex > index) {
            // Adjust editing index if deleting an item before it
            setEditingExemplarIndex(editingExemplarIndex - 1)
        }
    }, [currentNode, editingExemplarIndex, setNodes])

    const animationsTypeHas = (currentNode?.data as StateNodeData)?.animations_type_has || { pre: false, during: false, post: false };

    return (
        <div>
            <div className="mb-3">
                <label className="block text-sm font-semibold mb-1">Personality Profile:</label>
                <select
                    value={(currentNode?.data as StateNodeData)?.personality || 'Neutral'}
                    onChange={(e) => updateStateProperty('personality', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    value={(currentNode?.data as StateNodeData)?.context || ''}
                    onChange={(e) => updateStateProperty('context', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    placeholder="Enter context..."
                />
            </div>

            <div className="mb-3">
                <label className="block text-sm font-semibold mb-1">Number of Retries:</label>
                <input
                    type="number"
                    min="1"
                    max="5"
                    value={(currentNode?.data as StateNodeData)?.retryCount || 1}
                    onChange={(e) => {
                        const value = Math.min(5, Math.max(1, parseInt(e.target.value) || 1))
                        updateStateProperty('retryCount', value)
                    }}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="mb-3">
                <label className="block text-sm font-semibold mb-1">Animations Type:</label>
                <div className="flex gap-1 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                        <input
                            type="checkbox"
                            checked={animationsTypeHas.pre}
                            onChange={(e) => updateAnimationType('pre', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">Pre Animations</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                        <input
                            type="checkbox"
                            checked={animationsTypeHas.during}
                            onChange={(e) => updateAnimationType('during', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">During Animations</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                        <input
                            type="checkbox"
                            checked={animationsTypeHas.post}
                            onChange={(e) => updateAnimationType('post', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">Post Animations</span>
                    </label>
                </div>
            </div>

            <div className="mb-3">
                <label className="block text-sm font-semibold mb-2">List Exemplar:</label>

                {/* Input field for new exemplar */}
                <div className="mb-3 space-y-2">
                    <input
                        ref={exemplarInputRef}
                        type="text"
                        value={currentExemplar}
                        onChange={(e) => setCurrentExemplar(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addExemplar()
                            } else if (e.key === 'Escape') {
                                e.preventDefault()
                                setCurrentExemplar('')
                                setEditingExemplarIndex(null)
                                if (exemplarInputRef.current) {
                                    exemplarInputRef.current.blur()
                                }
                            }
                        }}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={editingExemplarIndex !== null ? "Edit exemplar..." : "Type exemplar..."}
                    />

                    <button
                        onClick={addExemplar}
                        disabled={!currentExemplar.trim()}
                        className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {editingExemplarIndex !== null ? 'Update Exemplar' : 'Add Exemplar'}
                    </button>
                </div>

                {editingExemplarIndex !== null && (
                    <div className="mb-2 text-xs text-blue-600 font-semibold">
                        Editing exemplar {editingExemplarIndex + 1} • Press Esc to cancel
                    </div>
                )}

                {/* List of exemplars */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {((currentNode?.data as StateNodeData)?.exemplars || []).map((exemplar, index) => (
                        <div key={index} className={`flex items-start gap-2 px-3 py-2 rounded border transition-all ${editingExemplarIndex === index
                            ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                            : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className="flex-1 text-sm break-words whitespace-normal">{exemplar}</div>
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => editExemplar(index)}
                                    className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold transition"
                                    title="Edit exemplar"
                                >
                                    ✎
                                </button>
                                <button
                                    onClick={() => deleteExemplar(index)}
                                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition"
                                    title="Delete exemplar"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
});

export default EditState;