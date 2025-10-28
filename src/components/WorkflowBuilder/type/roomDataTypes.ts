export interface Point {
	x: number;
	y: number;
	selected_for: string | null; // for now it will be 'Angry Avatar'
	animation_type: string | null; // for now it will be 'Pre Animation'
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