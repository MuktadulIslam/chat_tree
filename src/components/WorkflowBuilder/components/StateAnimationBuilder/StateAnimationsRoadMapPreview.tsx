import React, { memo, useCallback, useState } from 'react';
import { FaLocationCrosshairs } from "react-icons/fa6";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaArrowDownLong } from "react-icons/fa6";
import { WorkFlow } from '../../type/stateAnimationBuilderDataType';
import AnimationTags from './AnimationTags';
import { useStateAnimationBuilder } from '../../context/StateAnimationBuilderContextProvider';
import { useRoom } from '../../context/RoomContextProvider';
import { Point } from '../../type/roomDataTypes';

const WorkflowContent = memo(function WorkflowContent({ workflow }: { workflow: WorkFlow }) {
    return (
        <div className="min-w-20 flex items-start justify-between">
            <div className="flex-1 min-w-0">
                {/* Workflow Title and Order */}
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        {workflow.order}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 truncate">
                        {workflow.title}
                    </h3>
                </div>

                {/* Workflow Description */}
                {/* <p className="text-gray-600 text-sm line-clamp-2">
                    {workflow.context}
                </p> */}
                <p className={`${workflow.state_type === 'end' ? 'text-red-400 ' : 'text-blue-400 '} mb-1 line-clamp-2 text-sm`}>
                    <strong>
                        <span className='mr-1'>State:</span>
                        {workflow.state_name}
                    </strong>
                </p>

                <div className="flex gap-3">
                    <AnimationTags types={[workflow.animation.type]} />
                    {/* Workflow Metadata */}
                    {workflow.position && (
                        <div className="flex items-center gap-1 text-gray-500 text-sm font-semibold">
                            <FaLocationCrosshairs />
                            <span>{`[${workflow.position.x}, ${workflow.position.y}, ${workflow.rotation}°]`}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});


const SortableWorkflow = memo(function SortableWorkflow({ workflow }: { workflow: WorkFlow }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: workflow.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`p-2 border-2 rounded-lg transition-all duration-200 cursor-grab active:cursor-grabbing ${isDragging
                ? 'bg-blue-50 border-blue-400 shadow-lg opacity-80 z-50'
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
        >
            <WorkflowContent workflow={workflow} />
        </div>
    );
});

// Workflow Drag Overlay Component
const WorkflowDragOverlay: React.FC<{ workflow: WorkFlow }> = ({ workflow }) => {
    return (
        <div className="p-4 border-2 border-blue-400 bg-blue-50 rounded-xl shadow-lg opacity-90 cursor-grabbing">
            <WorkflowContent workflow={workflow} />
        </div>
    );
};


// Main Workflow Manager Component
const StateAnimationsRoadMapPreview = memo(function StateAnimationsRoadMapPreview() {
    const { setPreviousPoint } = useRoom();
    const { workflows, setWorkflows, selectedStatesForAnimation } = useStateAnimationBuilder();
    const [activeWorkflow, setActiveWorkflow] = useState<WorkFlow | null>(null);

    // Filter workflows for the selected state only
    const filteredWorkflows = selectedStatesForAnimation ? workflows.filter(workflow => workflow.state_id == selectedStatesForAnimation.id) : [];

    // Configure sensors for different input methods
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handle drag start
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const workflow = workflows.find(w => w.id === active.id);
        setActiveWorkflow(workflow || null);
    };

    // const updateTheLastPositonInRoomView = () => {
    //     const lastWorkflow: WorkFlow = (filteredWorkflows.sort((a, b) => a.order - b.order))[filteredWorkflows.length - 1];

    //     const lastPosition: Point = {
    //         x: lastWorkflow.position?.x ?? 0,
    //         y: lastWorkflow.position?.y ?? 0,
    //         rotation: lastWorkflow?.rotation ?? 0,
    //         selected_for: lastWorkflow.state_name,
    //         roadmap_node: lastWorkflow?.title,
    //         animation_type: null
    //     }
    //     setPreviousPoint(lastPosition)
    // }

    // Handle drag end and reorder with order attribute update
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveWorkflow(null);

        if (over && active.id !== over.id) {
            setWorkflows((currentWorkflows) => {
                const oldIndex = currentWorkflows.findIndex((item) => item.id === active.id);
                const newIndex = currentWorkflows.findIndex((item) => item.id === over.id);

                const reorderedWorkflows = arrayMove(currentWorkflows, oldIndex, newIndex);

                // Update order attributes based on new positions
                return reorderedWorkflows.map((workflow, index) => ({
                    ...workflow,
                    order: index + 1
                }));
            });
        }
        // updateTheLastPositonInRoomView()
    };

    return (
        <div className="w-full h-full bg-white rounded-2xl border shadow-lg flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900 p-2 border-b-2">Animations Roadmap ({filteredWorkflows.length})</h3>
            <div className="w-full h-full overflow-hidden p-2">
                {!selectedStatesForAnimation ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <p className="text-lg font-semibold">No State Selected</p>
                            <p className="text-sm">Please select a state to view its animation roadmap</p>
                        </div>
                    </div>
                ) : filteredWorkflows.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <p className="text-lg font-semibold">No Workflows Created</p>
                            <p className="text-sm">Create workflows for "{selectedStatesForAnimation.name}" to see them here</p>
                        </div>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        {/* Scrollable Workflow List */}
                        <div className="h-full overflow-y-auto overflow-x-hidden pr-2">
                            <SortableContext items={filteredWorkflows.map(w => w.id)} strategy={verticalListSortingStrategy}>
                                <div className="">
                                    {filteredWorkflows.map((workflow, index) => (
                                        <div key={workflow.id}>
                                            <SortableWorkflow workflow={workflow} />
                                            {filteredWorkflows.length - 1 !== index && (
                                                <div className="w-full h-auto p-1 flex justify-center">
                                                    <FaArrowDownLong size={25} className='text-gray-700' />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </SortableContext>
                        </div>

                        {/* Drag Overlay */}
                        <DragOverlay>
                            {activeWorkflow ? <WorkflowDragOverlay workflow={activeWorkflow} /> : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>
        </div>
    );
});

export default StateAnimationsRoadMapPreview;