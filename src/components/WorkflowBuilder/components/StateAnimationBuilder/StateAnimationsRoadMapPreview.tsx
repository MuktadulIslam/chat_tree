import React, { memo, useState } from 'react';
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
                <p className="text-gray-600 text-sm line-clamp-2">
                    {workflow.context}
                </p>
                <p className={`${workflow.state_type === 'end' ? 'text-red-400 ' : 'text-blue-400 '} mb-2 line-clamp-2 text-sm`}>
                    <strong>
                        <span className='mr-1'>State:</span>
                        {workflow.state_name}
                    </strong>
                </p>

                {/* Animation Types */}
                <div className="mb-1">
                    <AnimationTags types={[workflow.animation.type]} />
                </div>

                {/* Workflow Metadata */}
                {workflow.position && (
                    <div className="flex items-center gap-1 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{workflow.position.x}, {workflow.position.y}</span>
                    </div>
                )}
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
    const { workflows, setWorkflows } = useStateAnimationBuilder();
    const [activeWorkflow, setActiveWorkflow] = useState<WorkFlow | null>(null);

    console.log(workflows)

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
    };

    return (
        <div className="w-full h-full bg-white rounded-2xl border shadow-lg flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900 p-2 border-b-2">Animations Roadmap ({workflows.length})</h3>
            <div className="w-full h-full overflow-hidden p-2">
                {workflows.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <p className="text-lg font-semibold">No Workflows Created</p>
                            <p className="text-sm">Create workflows to see them here</p>
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
                            <SortableContext items={workflows.map(w => w.id)} strategy={verticalListSortingStrategy}>
                                <div className="">
                                    {workflows.map((workflow, index) => (
                                        <div key={workflow.id}>
                                            <SortableWorkflow workflow={workflow} />
                                            {workflows.length - 1 !== index && (
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