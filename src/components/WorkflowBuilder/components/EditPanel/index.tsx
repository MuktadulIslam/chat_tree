'use client'

import { memo, useCallback, useEffect, useState } from "react";
import { useWorkflow } from "../../context/WorkflowContextProvider";
import EditState from "./EditState";
import EditCriteria from "./EditCriteria";
import EditEnd from "./EditEnd";

const EditPanel = memo(function EditPanel() {
    const { setNodes, selectedNode, setSelectedNode } = useWorkflow();
    const [editValue, setEditValue] = useState<string>(selectedNode?.data.label || '');

    useEffect(() => {
        setEditValue(selectedNode?.data.label || '');
    }, [selectedNode]);

    const updateNodeLabel = useCallback((newLabel: string) => {
        if (!selectedNode) return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: { ...node.data, label: newLabel },
                    };
                }
                return node
            })
        )
    }, [selectedNode, setNodes])

    return (<>
        {selectedNode && (
            <div className="absolute top-5 right-4 bg-white shadow-xl rounded-lg p-4 z-10 border-2 border-gray-300 w-[500px] max-h-[calc(100vh-6rem)] overflow-y-auto">
                <h3 className="font-bold text-lg mb-3">Edit {selectedNode.type ? selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1) : 'Node'}</h3>
                
                {/* Only show name input for state and criteria nodes */}
                {(selectedNode.type === 'state' || selectedNode.type === 'criteria') && (
                    <div className="mb-3">
                        <label className="block text-sm font-semibold mb-1">Name:</label>
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => {
                                setEditValue(e.target.value)
                                updateNodeLabel(e.target.value)
                            }}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter name"
                        />
                    </div>
                )}

                {selectedNode.type === 'state' && (
                    <EditState />
                )}

                {selectedNode.type === 'criteria' && (
                    <EditCriteria />
                )}

                {selectedNode.type === 'end' && (
                    <EditEnd />
                )}

                <button
                    onClick={() => setSelectedNode(null)}
                    className="w-full px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-semibold transition"
                >
                    Close
                </button>
            </div>
        )}
    </>)
});

export default EditPanel;