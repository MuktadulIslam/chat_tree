'use client'
import { memo, useCallback, useRef, useState } from "react";
import { useWorkflow } from "../../context/WorkflowContextProvider";
import { Example, ImportanceLevel } from "../../type";

const EditCriteria = memo(function EditCriteria() {
    const { setNodes, selectedNode } = useWorkflow();

    const inputRef = useRef<HTMLInputElement>(null);
    const [currentExample, setCurrentExample] = useState<string>('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [currentImportance, setCurrentImportance] = useState<ImportanceLevel>('Medium');

    const addExample = useCallback(() => {
        if (!selectedNode || selectedNode.type !== 'criteria' || !currentExample.trim()) return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    const examples = node.data.examples || []
                    let newExamples: Example[]

                    if (editingIndex !== null) {
                        // Update existing example
                        newExamples = examples.map((ex, idx) =>
                            idx === editingIndex ? { text: currentExample.trim(), importance: currentImportance } : ex
                        )
                    } else {
                        // Add new example
                        newExamples = [...examples, { text: currentExample.trim(), importance: currentImportance }]
                    }

                    const updatedNode = {
                        ...node,
                        data: {
                            ...node.data,
                            examples: newExamples,
                            currentInput: ''
                        },
                    }

                    return updatedNode
                }
                return node
            })
        )

        setCurrentExample('')
        setCurrentImportance('Medium')
        setEditingIndex(null)
    }, [selectedNode, currentExample, currentImportance, editingIndex, setNodes])

    const updateCurrentExample = useCallback((text: string) => {
        if (!selectedNode || selectedNode.type !== 'criteria') return;

        setCurrentExample(text)
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            currentInput: text
                        },
                    }
                }
                return node
            })
        )
    }, [selectedNode, setNodes]);

    const editExample = useCallback((index: number) => {
        if (!selectedNode || selectedNode.type !== 'criteria') return;

        const examples = selectedNode.data.examples || []
        if (index < examples.length) {
            const example = examples[index]
            setCurrentExample(example.text)
            setCurrentImportance(example.importance || 'Medium')
            setEditingIndex(index)

            // Update node to show current input
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === selectedNode.id) {
                        const updatedNode = {
                            ...node,
                            data: {
                                ...node.data,
                                currentInput: example.text
                            },
                        }
                        return updatedNode
                    }
                    return node
                })
            )

            // Focus input
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }
    }, [selectedNode, setNodes])

    // Delete example from criteria node
    const deleteExample = useCallback((index: number) => {
        if (!selectedNode || selectedNode.type !== 'criteria') return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    const examples = node.data.examples || []
                    const updatedNode = {
                        ...node,
                        data: {
                            ...node.data,
                            examples: examples.filter((_, i) => i !== index)
                        },
                    }
                    return updatedNode
                }
                return node
            })
        )

        // Reset editing if we're deleting the example being edited
        if (editingIndex === index) {
            setEditingIndex(null)
            setCurrentExample('')
            setCurrentImportance('Medium')
        } else if (editingIndex !== null && editingIndex > index) {
            // Adjust editing index if deleting an item before it
            setEditingIndex(editingIndex - 1)
        }
    }, [selectedNode, editingIndex, setNodes])

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
        <div className="mb-3">
            <label className="block text-sm font-semibold mb-2">Examples:</label>

            {/* Input field for new example */}
            <div className="mb-3 space-y-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={currentExample}
                    onChange={(e) => updateCurrentExample(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            addExample()
                        } else if (e.key === 'Escape') {
                            e.preventDefault()
                            setCurrentExample('')
                            setCurrentImportance('Medium')
                            setEditingIndex(null)
                            if (inputRef.current) {
                                inputRef.current.blur()
                            }
                        }
                    }}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder={editingIndex !== null ? "Edit example..." : "Type example..."}
                />

                <div className="flex gap-2 items-center">
                    <label className="text-sm font-medium">Importance:</label>
                    <select
                        value={currentImportance}
                        onChange={(e) => setCurrentImportance(e.target.value as ImportanceLevel)}
                        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                        <option value="Very Low">Very Low</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Very High">Very High</option>
                    </select>
                </div>

                <button
                    onClick={addExample}
                    disabled={!currentExample.trim()}
                    className="w-full px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {editingIndex !== null ? 'Update Example' : 'Add Example'}
                </button>
            </div>

            {editingIndex !== null && (
                <div className="mb-2 text-xs text-blue-600 font-semibold">
                    Editing example {editingIndex + 1} • Press Esc to cancel
                </div>
            )}

            {/* List of examples */}
            <div className="space-y-2 max-h-68 overflow-y-auto">
                {(selectedNode?.data.examples || []).map((example, index) => (
                    <div key={index} className={`flex items-start gap-2 px-1.5 py-1 rounded border transition-all ${editingIndex === index
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                        : 'bg-yellow-50 border-yellow-200'
                        }`}>
                        <div className="flex-1 space-y-1 overflow-hidden">
                            <span className={`inline-block text-xs px-1 rounded font-semibold ${getImportanceColor(example.importance)}`}>
                                {example.importance}
                            </span>
                            <div className="text-sm break-words whitespace-normal">{example.text}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button
                                onClick={() => editExample(index)}
                                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold transition"
                                title="Edit example"
                            >
                                ✎
                            </button>
                            <button
                                onClick={() => deleteExample(index)}
                                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition"
                                title="Delete example"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
});

export default EditCriteria;