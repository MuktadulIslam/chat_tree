import { Personality } from ".";

export type StateType = 'end' | 'start' | 'state';
export type AnimationType = 'Pre' | 'During' | 'Post';

export interface AnimationSeance {
    name: string;
    animations: string[];
}

export interface Animations {
    type: AnimationType;
    animation_seance: AnimationSeance[];
}

export interface WorkFlow {
    id: string;
    title: string;
    context?: string;
    state_name: string;
    state_type: StateType;
    animations: Animations[];
    order: number;
    position?: { x: number; y: number };
}

export interface State {
    id: string;
    name: string;
    state_type: StateType;
    context: string;
    animation_types: AnimationType[];
    personality: Personality
}