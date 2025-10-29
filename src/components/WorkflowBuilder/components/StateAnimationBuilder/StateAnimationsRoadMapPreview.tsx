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

// Generate workflow data
const generateWorkFlows = (): WorkFlow[] => {
    const baseWorkFlows: WorkFlow[] = [
        {
            id: '1',
            title: 'User Authentication Flow',
            context: 'Handle user login, registration, and session management Handle user login, registration, and session management',
            state_name: 'Asuth Pending',
            state_type: 'state',
            animations: [
                { type: 'Pre', animation_seance: [] },
                { type: 'During', animation_seance: [] }
            ],
            order: 1,
            position: { x: 100, y: 100 }
        },
        {
            id: '2',
            title: 'Data Processing Pipeline',
            context: 'Process and transform incoming data streams',
            state_name: 'Processing',
            state_type: 'state',
            animations: [
                { type: 'During', animation_seance: [] }
            ],
            order: 2
        },
        {
            id: '3',
            title: 'File Upload Handler',
            context: 'Manage file uploads with validation and storage',
            state_name: 'Upload Complete',
            state_type: 'end',
            animations: [
                { type: 'Pre', animation_seance: [] },
                { type: 'Post', animation_seance: [] }
            ],
            order: 3,
            position: { x: 100, y: 300 }
        },
        {
            id: '4',
            title: 'Payment Gateway Integration',
            context: 'Handle payment processing and transaction management',
            state_name: 'Payment Pending',
            state_type: 'state',
            animations: [
                { type: 'During', animation_seance: [] }
            ],
            order: 4,
            position: { x: 100, y: 400 }
        },
        {
            id: '5',
            title: 'Email Notification System',
            context: 'Send automated emails and track delivery status',
            state_name: 'Notification Sent',
            state_type: 'end',
            animations: [
                { type: 'Post', animation_seance: [] }
            ],
            order: 5
        },
        {
            id: '6',
            title: 'API Rate Limiter',
            context: 'Manage API request limits and throttling',
            state_name: 'Rate Limited',
            state_type: 'state',
            animations: [
                { type: 'Pre', animation_seance: [] },
                { type: 'During', animation_seance: [] }
            ],
            order: 6,
            position: { x: 100, y: 600 }
        },
        {
            id: '7',
            title: 'Cache Management',
            context: 'Handle data caching and cache invalidation',
            state_name: 'Cache Updated',
            state_type: 'state',
            animations: [
                { type: 'During', animation_seance: [] },
                { type: 'Post', animation_seance: [] }
            ],
            order: 7,
            position: { x: 100, y: 700 }
        },
        {
            id: '8',
            title: 'Error Handling Flow',
            context: 'Manage application errors and exception handling',
            state_name: 'Error Handled',
            state_type: 'end',
            animations: [
                { type: 'Post', animation_seance: [] }
            ],
            order: 8,
            position: { x: 100, y: 800 }
        },
        {
            id: '9',
            title: 'Data Synchronization',
            context: 'Sync data across multiple devices and platforms',
            state_name: 'Sync In Progress',
            state_type: 'state',
            animations: [
                { type: 'During', animation_seance: [] }
            ],
            order: 9,
            position: { x: 100, y: 900 }
        },
        {
            id: '10',
            title: 'Background Job Processor',
            context: 'Process background jobs and scheduled tasks',
            state_name: 'Job Queued',
            state_type: 'state',
            animations: [
                { type: 'Pre', animation_seance: [] },
                { type: 'During', animation_seance: [] },
                { type: 'Post', animation_seance: [] }
            ],
            order: 10,
            position: { x: 100, y: 1000 }
        }
    ];

    return baseWorkFlows;
};


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
                    <AnimationTags types={workflow.animations.map((animation) => animation.type)} />
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
})


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
            className={`p-2 border-2 rounded-xl transition-all duration-200 cursor-grab active:cursor-grabbing ${isDragging
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
const StateAnimationsRoadMapPreview = memo(function StateAnimationsRoadMapPreview({ initialWorkFlows = generateWorkFlows() }: { initialWorkFlows?: WorkFlow[] }) {
    const [workflows, setWorkflows] = useState<WorkFlow[]>(initialWorkFlows);
    const [activeWorkflow, setActiveWorkflow] = useState<WorkFlow | null>(null);

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
                                    <div key={index}>
                                        <SortableWorkflow
                                            key={workflow.id}
                                            workflow={workflow}
                                        />
                                        {workflows.length - 1 != index &&
                                            (<div className="w-full h-auto p-1 flex justify-center">
                                                <FaArrowDownLong size={25} className='text-gray-700'/>
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
            </div>
        </div>
    );
});

export default StateAnimationsRoadMapPreview;