import { AnimationType } from "./stateAnimationBuilderDataType";

export interface Point {
	x: number;
	y: number;
	rotation: number;
	selected_for: string | null;
	roadmap_node?: string;
	animation_type: AnimationType | null;
}

export interface RoomObject {
	id: string;
	name: string;
	position: {
		x: number;
		y: number;
	};
	dimensions: {
		length: number;
		width: number;
	};
	rotation: number; // in degrees
}

export interface Opening {
	name: string;
	wall_name: 'front' | 'back' | 'left' | 'right'; // front=bottom, back=top, left=left, right=right
	position: number; // movement along the wall axis
	width: number;
}

export  interface RoomData {
	room_dimensions: {
		length: number;
		width: number;
	};
	objects: RoomObject[];
	openings?: Opening[];
}