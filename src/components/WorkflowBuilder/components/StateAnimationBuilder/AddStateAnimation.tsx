'use client';
import { memo, useState, useCallback, useEffect } from "react";
import { IoCloseCircle } from "react-icons/io5";

import { AnimationType, WorkFlow } from "../../type/stateAnimationBuilderDataType";
import { useStateAnimationBuilder } from "../../context/StateAnimationBuilderContextProvider";
import PersonalityStyleComponent from "./PersonalityStyleComponent";
import { useRoom } from "../../context/RoomContextProvider";

// Animation seance options mapping
const ANIMATION_SEANCE_OPTIONS = {
    'Avatar': ['Standing', 'Walking', 'Running', 'Seating'],
    'PC Monitor': ['Start', 'See Records', 'Turn off']
};

const AddStateAnimation = memo(function AddStateAnimation() {
    const { selectedPoint, setPreviousPoint, setSelectedPoint, setSelectedStateName } = useRoom();

    const { selectedStatesForAnimation, setSelectedStatesForAnimation } = useStateAnimationBuilder();
    const { workflows, setWorkflows } = useStateAnimationBuilder();

    // State for workflow form
    const [workflowTitle, setWorkflowTitle] = useState<string>('');
    const [selectedAnimationTypes, setSelectedAnimationTypes] = useState<AnimationType[]>([]);
    const [selectedAnimationSeance, setSelectedAnimationSeance] = useState<string>('');
    const [selectedAnimations, setSelectedAnimations] = useState<string[]>([]);


    // Reset form when node changes
    useEffect(() => {
        if (selectedStatesForAnimation) {
            setWorkflowTitle(selectedStatesForAnimation.name);
            setSelectedAnimationTypes([]);
            setSelectedAnimationSeance('');
            setSelectedAnimations([]);
        }
    }, [selectedStatesForAnimation]);

    // Add animation type
    const addAnimationType = useCallback((type: AnimationType) => {
        if (!selectedAnimationTypes.includes(type)) {
            setSelectedAnimationTypes(prev => [...prev, type]);
        }
    }, [selectedAnimationTypes]);

    // Remove animation type
    const removeAnimationType = useCallback((type: AnimationType) => {
        setSelectedAnimationTypes(prev => prev.filter(t => t !== type));
    }, []);

    // Add animation
    const addAnimation = useCallback((animation: string) => {
        if (!selectedAnimations.includes(animation)) {
            setSelectedAnimations(prev => [...prev, animation]);
        }
    }, [selectedAnimations]);

    // Remove animation
    const removeAnimation = useCallback((animation: string) => {
        setSelectedAnimations(prev => prev.filter(a => a !== animation));
    }, []);

    // Handle cancel
    const handleCancel = useCallback(() => {
        // Reset form
        setWorkflowTitle('');
        setSelectedAnimationTypes([]);
        setSelectedAnimationSeance('');
        setSelectedAnimations([]);

        // Deselect node
        setSelectedStatesForAnimation(null);
    }, [setSelectedStatesForAnimation]);

    // Handle save workflow
    const handleSaveWorkflow = useCallback(() => {
        if (!selectedStatesForAnimation) return;

        // Create animations array based on selected types
        const animations = selectedAnimationTypes.map(type => ({
            type,
            animation_seance: [{
                name: selectedAnimationSeance,
                animations: selectedAnimations
            }]
        }));

        // Get the highest order number from existing workflows
        const maxOrder = workflows.length > 0
            ? Math.max(...workflows.map(w => w.order || 0))
            : 0;

        // Create new workflow
        const newWorkflow: WorkFlow = {
            id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: workflowTitle.trim(),
            context: selectedStatesForAnimation.context,
            state_name: selectedStatesForAnimation.name,
            state_type: selectedStatesForAnimation.state_type,
            animations: animations,
            order: maxOrder + 1
        };
        if (selectedPoint) newWorkflow.position = { x: selectedPoint.x, y: selectedPoint.y }

        // Add workflow to workflows state
        setWorkflows(prev => [...prev, newWorkflow]);

        // Reset form
        setWorkflowTitle('');
        setSelectedAnimationTypes([]);
        setSelectedAnimationSeance('');
        setSelectedAnimations([]);

        // Deselect node after saving
        setSelectedStatesForAnimation(null);
        const previousPoint = selectedPoint;
        if (previousPoint) {
            previousPoint.animation_type = selectedAnimationTypes;
        }
        setPreviousPoint(previousPoint);
        setSelectedPoint(null);
        setSelectedStateName(null)
    }, [
        workflowTitle,
        selectedAnimationTypes,
        selectedAnimationSeance,
        selectedAnimations,
        selectedStatesForAnimation,
        workflows,
        setWorkflows,
        setSelectedStatesForAnimation,
        selectedPoint,
        setPreviousPoint,
        setSelectedPoint
    ]);

    if (!selectedStatesForAnimation) {
        return (
            <div className="mt-1 w-full h-full pb-1">
                <div className="w-full h-full bg-gray-50 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <p className="text-lg font-semibold mb-2">No State Selected</p>
                        <p className="text-sm">Please select a State or End node from the state list to create animations</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white overflow-hidden flex flex-col mt-1 space-y-3">
            {/* Header Section */}
            <div className="w-full h-auto flex gap-2">
                <div className="flex-1 border py-1 px-2 rounded-lg">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedStatesForAnimation.name}</h3>
                        <div className="text-xs text-gray-600 font-extrabold flex">
                            <span>
                                Type: {selectedStatesForAnimation.state_type?.replace(/\b\w/g, char => char.toUpperCase())}
                            </span>
                            <span className="mx-1">|</span>
                            <PersonalityStyleComponent personality={selectedStatesForAnimation.personality} />
                        </div>
                    </div>
                    {selectedStatesForAnimation.context && (
                        <p className="text-sm text-gray-700 line-clamp-2">
                            <span className="font-bold mr-1 underline">Context:</span>
                            {selectedStatesForAnimation.context}
                        </p>
                    )}
                </div>

                <div className="w-24 h-full space-y-1">
                    <button
                        onClick={handleSaveWorkflow}
                        disabled={!workflowTitle.trim() || selectedAnimationTypes.length === 0 || !selectedAnimationSeance || selectedAnimations.length === 0}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleCancel}
                        className="w-full py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <div className="w-full flex gap-3 items-center pl-1">
                <label className="block text-base font-bold mb-1 flex-none">Workflow Title:</label>
                <input
                    type="text"
                    value={workflowTitle}
                    onChange={(e) => setWorkflowTitle(e.target.value)}
                    className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter workflow title..."
                />
            </div>

            <div className="w-full flex items-center gap-1 pl-1">
                <p className="block text-base font-bold mb-1 flex-none">Selected Point:</p>
                <div className="px-2 border rounded font-semibold text-base relative">
                    {selectedPoint ?
                        <span>{`${selectedPoint.x} , ${selectedPoint.y}`}</span>
                        : <span>{`None , None`}</span>
                    }
                </div>
                {selectedPoint &&
                    <button className="bg-red-500 flex gap-1 px-2 items-center text-white rounded ml-4 cursor-pointer"
                        onClick={() => setSelectedPoint(null)}
                    >
                        Deselect
                        <IoCloseCircle size={18} />
                    </button>
                }
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto flex gap-1 pb-1">
                {/* First Section: Animation Types */}
                <div className="border py-1 px-2 rounded-xl overflow-hidden flex-1">
                    <label className="text-base font-semibold mb-2 line-clamp-1">Selected Animation Types:</label>

                    {/* Selected Animation Types Display */}
                    {selectedAnimationTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-2 p-1 bg-gray-50 overflow-hidden rounded border border-dashed">
                            {selectedAnimationTypes.map(type => (
                                <div key={type} className={`relative px-3 rounded border font-medium`}>
                                    {type}
                                    <button
                                        onClick={() => removeAnimationType(type)}
                                        className="absolute -top-1 -right-2 text-red-500 bg-white rounded-full cursor-pointer"
                                    >
                                        <IoCloseCircle size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-2 bg-gray-50 rounded border text-sm text-gray-500 text-center">
                            No animation types selected
                        </div>
                    )}

                    {/* Animation Type Dropdown */}
                    <select
                        value=""
                        onChange={(e) => {
                            if (e.target.value) {
                                addAnimationType(e.target.value as AnimationType);
                                e.target.value = '';
                            }
                        }}
                        className="w-full px-3 py-1 mt-2 border rounded outline-none"
                    >
                        <option value="" disabled>Select type</option>
                        {selectedStatesForAnimation.animation_types
                            .filter(type => !selectedAnimationTypes.includes(type))
                            .map(animation => (
                                <option key={animation} value={animation}>{animation}</option>
                            ))
                        }
                    </select>
                </div>

                {/* Second Section: Animation Seance */}
                <div className="border py-1 px-2 rounded-xl overflow-hidden flex-1">
                    <label className="text-base font-semibold line-clamp-1">Animation Seance:</label>
                    <select
                        value={selectedAnimationSeance}
                        onChange={(e) => {
                            setSelectedAnimationSeance(e.target.value);
                            setSelectedAnimations([]); // Reset selected animations when seance changes
                        }}
                        className="w-full px-3 py-1 mt-2 border rounded outline-none"
                    >
                        <option value="">Select animation</option>
                        {Object.keys(ANIMATION_SEANCE_OPTIONS).map(seance => (
                            <option key={seance} value={seance}>{seance}</option>
                        ))}
                    </select>
                </div>

                {/* Third Section: Animations */}
                <div className="border py-1 px-2 rounded-xl overflow-hidden flex-1">
                    <label className="text-base font-semibold line-clamp-1">Animations for {selectedAnimationSeance}:</label>

                    {/* Selected Animations Display */}

                    {selectedAnimations.length > 0 ? (
                        <div className="flex flex-wrap gap-2 p-1 bg-gray-50 overflow-hidden rounded border border-dashed">
                            {selectedAnimations.map(type => (
                                <div key={type} className={`relative px-3 rounded border font-medium`}>
                                    {type}
                                    <button
                                        onClick={() => removeAnimation(type)}
                                        className="absolute -top-1 -right-2 text-red-500 bg-white rounded-full cursor-pointer"
                                    >
                                        <IoCloseCircle size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-2 bg-gray-50 rounded border text-sm text-gray-500 text-center">
                            No animations selected
                        </div>
                    )}

                    {/* Animation Type Dropdown */}
                    <select
                        value=""
                        onChange={(e) => {
                            if (e.target.value) {
                                addAnimation(e.target.value);
                                e.target.value = '';
                            }
                        }}
                        className="w-full px-3 py-1 mt-2 border rounded outline-none"
                    >
                        <option value="" disabled>Select animation</option>
                        {ANIMATION_SEANCE_OPTIONS[selectedAnimationSeance as keyof typeof ANIMATION_SEANCE_OPTIONS]
                            ?.filter(animation => !selectedAnimations.includes(animation))
                            .map(animation => (
                                <option key={animation} value={animation}>{animation}</option>
                            ))
                        }
                    </select>
                </div>
            </div>
        </div>
    );
});

export default AddStateAnimation;