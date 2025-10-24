'use client'
import { memo, useCallback, useRef, useState, useEffect } from "react";
import { useWorkflow } from "../../context/WorkflowContextProvider";
import { Example, ImportanceLevel, SubCriteria } from "../../type";

const EditCriteria = memo(function EditCriteria() {
    const { setNodes, selectedNode, nodes } = useWorkflow();

    const inputRef = useRef<HTMLInputElement>(null);
    const subCriteriaInputRef = useRef<HTMLInputElement>(null);
    
    const [selectedSubCriteriaId, setSelectedSubCriteriaId] = useState<string | null>(null);
    const [newSubCriteriaName, setNewSubCriteriaName] = useState<string>('');
    const [editingSubCriteriaId, setEditingSubCriteriaId] = useState<string | null>(null);
    const [currentExample, setCurrentExample] = useState<string>('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [currentImportance, setCurrentImportance] = useState<ImportanceLevel>('Medium');

    // Get current node data (to avoid stale state)
    const currentNode = nodes.find(n => n.id === selectedNode?.id);

    // Auto-select first sub-criteria when node is selected
    useEffect(() => {
        if (currentNode && currentNode.type === 'criteria') {
            const subCriterias = currentNode.data.subCriterias || [];
            if (subCriterias.length > 0 && !selectedSubCriteriaId) {
                setSelectedSubCriteriaId(subCriterias[0].id);
            }
        }
    }, [currentNode, selectedSubCriteriaId]);

    // Get currently selected sub-criteria
    const getSelectedSubCriteria = useCallback((): SubCriteria | null => {
        if (!currentNode || currentNode.type !== 'criteria' || !selectedSubCriteriaId) return null;
        const subCriterias = currentNode.data.subCriterias || [];
        return subCriterias.find(sc => sc.id === selectedSubCriteriaId) || null;
    }, [currentNode, selectedSubCriteriaId]);

    // Add or update sub-criteria
    const addSubCriteria = useCallback(() => {
        if (!currentNode || currentNode.type !== 'criteria' || !newSubCriteriaName.trim()) return;

        if (editingSubCriteriaId) {
            // Update existing sub-criteria
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === currentNode.id) {
                        const subCriterias = node.data.subCriterias || [];
                        const updatedSubCriterias = subCriterias.map(sc => 
                            sc.id === editingSubCriteriaId 
                                ? { ...sc, name: newSubCriteriaName.trim() }
                                : sc
                        );

                        return {
                            ...node,
                            data: {
                                ...node.data,
                                subCriterias: updatedSubCriterias,
                                currentSubCriteriaInput: ''
                            },
                        };
                    }
                    return node;
                })
            );

            setEditingSubCriteriaId(null);
        } else {
            // Add new sub-criteria
            const newId = `sub-${Date.now()}-${Math.random()}`;
            
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === currentNode.id) {
                        const subCriterias = node.data.subCriterias || [];
                        const newSubCriteria: SubCriteria = {
                            id: newId,
                            name: newSubCriteriaName.trim(),
                            examples: []
                        };

                        return {
                            ...node,
                            data: {
                                ...node.data,
                                subCriterias: [...subCriterias, newSubCriteria],
                                currentSubCriteriaInput: ''
                            },
                        };
                    }
                    return node;
                })
            );

            // Auto-select the newly created sub-criteria
            setSelectedSubCriteriaId(newId);
        }

        setNewSubCriteriaName('');
    }, [currentNode, newSubCriteriaName, editingSubCriteriaId, setNodes]);

    // Update newSubCriteriaName and sync with node data (only for new sub-criteria, not edits)
    const updateNewSubCriteriaName = useCallback((text: string) => {
        if (!currentNode || currentNode.type !== 'criteria') return;

        setNewSubCriteriaName(text);
        
        // Only show real-time preview if we're adding new (not editing existing)
        if (!editingSubCriteriaId) {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === currentNode.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                currentSubCriteriaInput: text
                            },
                        };
                    }
                    return node;
                })
            );
        }
    }, [currentNode, editingSubCriteriaId, setNodes]);

    // Start editing a sub-criteria
    const editSubCriteria = useCallback((subCriteriaId: string) => {
        if (!currentNode || currentNode.type !== 'criteria') return;

        const subCriterias = currentNode.data.subCriterias || [];
        const subCriteria = subCriterias.find(sc => sc.id === subCriteriaId);
        
        if (subCriteria) {
            setNewSubCriteriaName(subCriteria.name);
            setEditingSubCriteriaId(subCriteriaId);
            
            // Focus the input
            if (subCriteriaInputRef.current) {
                subCriteriaInputRef.current.focus();
            }
        }
    }, [currentNode]);

    // Delete sub-criteria
    const deleteSubCriteria = useCallback((subCriteriaId: string) => {
        if (!currentNode || currentNode.type !== 'criteria') return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === currentNode.id) {
                    const subCriterias = node.data.subCriterias || [];
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            subCriterias: subCriterias.filter(sc => sc.id !== subCriteriaId)
                        },
                    };
                }
                return node;
            })
        );

        if (selectedSubCriteriaId === subCriteriaId) {
            setSelectedSubCriteriaId(null);
        }
    }, [currentNode, selectedSubCriteriaId, setNodes]);

    // Add or update example in selected sub-criteria
    const addExample = useCallback(() => {
        if (!currentNode || currentNode.type !== 'criteria' || !selectedSubCriteriaId || !currentExample.trim()) return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === currentNode.id) {
                    const subCriterias = node.data.subCriterias || [];
                    const updatedSubCriterias = subCriterias.map(sc => {
                        if (sc.id === selectedSubCriteriaId) {
                            let newExamples: Example[];

                            if (editingIndex !== null) {
                                // Update existing example
                                newExamples = sc.examples.map((ex, idx) =>
                                    idx === editingIndex ? { text: currentExample.trim(), importance: currentImportance } : ex
                                );
                            } else {
                                // Add new example
                                newExamples = [...sc.examples, { text: currentExample.trim(), importance: currentImportance }];
                            }

                            return {
                                ...sc,
                                examples: newExamples
                            };
                        }
                        return sc;
                    });

                    return {
                        ...node,
                        data: {
                            ...node.data,
                            subCriterias: updatedSubCriterias
                        },
                    };
                }
                return node;
            })
        );

        setCurrentExample('');
        setCurrentImportance('Medium');
        setEditingIndex(null);
    }, [currentNode, selectedSubCriteriaId, currentExample, currentImportance, editingIndex, setNodes]);

    // Update current example input (no longer needs to sync with node since examples aren't shown)
    const updateCurrentExample = useCallback((text: string) => {
        setCurrentExample(text);
    }, []);

    // Edit example
    const editExample = useCallback((index: number) => {
        const subCriteria = getSelectedSubCriteria();
        if (!subCriteria || index >= subCriteria.examples.length) return;

        const example = subCriteria.examples[index];
        setCurrentExample(example.text);
        setCurrentImportance(example.importance || 'Medium');
        setEditingIndex(index);

        // Focus input
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [getSelectedSubCriteria]);

    // Delete example
    const deleteExample = useCallback((index: number) => {
        if (!currentNode || currentNode.type !== 'criteria' || !selectedSubCriteriaId) return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === currentNode.id) {
                    const subCriterias = node.data.subCriterias || [];
                    const updatedSubCriterias = subCriterias.map(sc => {
                        if (sc.id === selectedSubCriteriaId) {
                            return {
                                ...sc,
                                examples: sc.examples.filter((_, i) => i !== index)
                            };
                        }
                        return sc;
                    });

                    return {
                        ...node,
                        data: {
                            ...node.data,
                            subCriterias: updatedSubCriterias
                        },
                    };
                }
                return node;
            })
        );

        // Reset editing if we're deleting the example being edited
        if (editingIndex === index) {
            setEditingIndex(null);
            setCurrentExample('');
            setCurrentImportance('Medium');
        } else if (editingIndex !== null && editingIndex > index) {
            setEditingIndex(editingIndex - 1);
        }
    }, [currentNode, selectedSubCriteriaId, editingIndex, setNodes]);

    const getImportanceColor = (importance: ImportanceLevel): string => {
        switch (importance) {
            case 'Very High': return 'bg-red-600 text-white'
            case 'High': return 'bg-orange-500 text-white'
            case 'Medium': return 'bg-yellow-400 text-black'
            case 'Low': return 'bg-blue-400 text-white'
            case 'Very Low': return 'bg-gray-400 text-white'
            default: return 'bg-yellow-400 text-black'
        }
    };

    const subCriterias = currentNode?.data.subCriterias || [];
    const selectedSubCriteria = getSelectedSubCriteria();

    return (
        <div className="mb-3">
            {/* Sub-Criteria Management */}
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <label className="block text-sm font-semibold mb-2">Sub-Criteria:</label>
                
                {/* Add new sub-criteria */}
                <div className="mb-3 space-y-2">
                    <input
                        ref={subCriteriaInputRef}
                        type="text"
                        value={newSubCriteriaName}
                        onChange={(e) => updateNewSubCriteriaName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addSubCriteria();
                            } else if (e.key === 'Escape') {
                                e.preventDefault();
                                setNewSubCriteriaName('');
                                setEditingSubCriteriaId(null);
                                if (currentNode && currentNode.type === 'criteria') {
                                    setNodes((nds) =>
                                        nds.map((node) => {
                                            if (node.id === currentNode.id) {
                                                return {
                                                    ...node,
                                                    data: {
                                                        ...node.data,
                                                        currentSubCriteriaInput: ''
                                                    },
                                                };
                                            }
                                            return node;
                                        })
                                    );
                                }
                                if (subCriteriaInputRef.current) {
                                    subCriteriaInputRef.current.blur();
                                }
                            }
                        }}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder={editingSubCriteriaId ? "Edit sub-criteria name..." : "New sub-criteria name..."}
                    />
                    <button
                        onClick={addSubCriteria}
                        disabled={!newSubCriteriaName.trim()}
                        className="w-full px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {editingSubCriteriaId ? 'Update Sub-Criteria' : 'Add Sub-Criteria'}
                    </button>
                </div>

                {editingSubCriteriaId && (
                    <div className="mb-2 text-xs text-blue-600 font-semibold">
                        Editing sub-criteria • Press Esc to cancel
                    </div>
                )}

                {/* List of sub-criteria */}
                <div className="space-y-2">
                    {subCriterias.map((subCriteria) => (
                        <div
                            key={subCriteria.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded border-2 cursor-pointer transition-all ${
                                editingSubCriteriaId === subCriteria.id
                                    ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300'
                                    : selectedSubCriteriaId === subCriteria.id
                                        ? 'bg-yellow-200 border-yellow-500 ring-2 ring-yellow-300'
                                        : 'bg-white border-yellow-300 hover:bg-yellow-50'
                            }`}
                            onClick={() => {
                                if (!editingSubCriteriaId) {
                                    setSelectedSubCriteriaId(subCriteria.id);
                                    setEditingIndex(null);
                                    setCurrentExample('');
                                    setCurrentImportance('Medium');
                                }
                            }}
                        >
                            <div className="flex-1 font-semibold text-sm">
                                {subCriteria.name}
                                <span className="ml-2 text-xs text-gray-600">
                                    ({subCriteria.examples.length} example{subCriteria.examples.length !== 1 ? 's' : ''})
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        editSubCriteria(subCriteria.id);
                                    }}
                                    className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold transition"
                                    title="Edit sub-criteria"
                                >
                                    ✎
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSubCriteria(subCriteria.id);
                                    }}
                                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition"
                                    title="Delete sub-criteria"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Example Management (only shown when a sub-criteria is selected) */}
            {selectedSubCriteria && (
                <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <label className="block text-sm font-semibold mb-2">
                        {`Examples for "${selectedSubCriteria.name}":`}
                    </label>

                    {/* Input field for new example */}
                    <div className="mb-3 space-y-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={currentExample}
                            onChange={(e) => updateCurrentExample(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addExample();
                                } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setCurrentExample('');
                                    setCurrentImportance('Medium');
                                    setEditingIndex(null);
                                    if (inputRef.current) {
                                        inputRef.current.blur();
                                    }
                                }
                            }}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={editingIndex !== null ? "Edit example..." : "Type example..."}
                        />

                        <div className="flex gap-2 items-center">
                            <label className="text-sm font-medium">Importance:</label>
                            <select
                                value={currentImportance}
                                onChange={(e) => setCurrentImportance(e.target.value as ImportanceLevel)}
                                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                        {selectedSubCriteria.examples.map((example, index) => (
                            <div key={index} className={`flex items-start gap-2 px-1.5 py-1 rounded border transition-all ${
                                editingIndex === index
                                    ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-200'
                                    : 'bg-white border-gray-200'
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
            )}

            {!selectedSubCriteria && subCriterias.length > 0 && (
                <div className="p-3 bg-gray-50 rounded text-sm text-gray-600 text-center">
                    Select a sub-criteria above to manage its examples
                </div>
            )}
        </div>
    );
});

export default EditCriteria;