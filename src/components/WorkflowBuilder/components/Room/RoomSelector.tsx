'use client';
import React, { useState, useRef, MouseEvent } from 'react';

interface Point {
	x: number;
	y: number;
}

interface RoomObject {
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

interface Opening {
	name: string;
	wall_name: 'front' | 'back' | 'left' | 'right'; // front=bottom, back=top, left=left, right=right
	position: number; // movement along the wall axis
	width: number;
}

interface RoomData {
	room_dimensions: {
		length: number;
		width: number;
	};
	objects: RoomObject[];
	openings?: Opening[];
}

const sampleRoomData: RoomData = {
	room_dimensions: {
		length: 50,
		width: 40,
	},
	objects: [
		// Bed (centered against top wall)
		{
			id: '1',
			name: 'King Bed',
			position: { x: 0, y: 15 },
			dimensions: { length: 8, width: 6 },
			rotation: 0,
		},
		// Nightstands on both sides of bed
		{
			id: '2',
			name: 'Nightstand',
			position: { x: -6, y: 15 },
			dimensions: { length: 2, width: 2 },
			rotation: 0,
		},
		{
			id: '3',
			name: 'Nightstand',
			position: { x: 6, y: 15 },
			dimensions: { length: 2, width: 2 },
			rotation: 0,
		},
		// Dresser on left wall
		{
			id: '4',
			name: 'Dresser',
			position: { x: -20, y: 8 },
			dimensions: { length: 6, width: 2 },
			rotation: 0,
		},
		// Wardrobe on left wall
		{
			id: '5',
			name: 'Wardrobe',
			position: { x: -20, y: -5 },
			dimensions: { length: 5, width: 3 },
			rotation: 0,
		},
		// Desk and chair on right wall
		{
			id: '6',
			name: 'Desk',
			position: { x: 18, y: 10 },
			dimensions: { length: 5, width: 3 },
			rotation: 0,
		},
		{
			id: '7',
			name: 'Office Chair',
			position: { x: 18, y: 7 },
			dimensions: { length: 2, width: 2 },
			rotation: 0,
		},
		// Reading nook in corner
		{
			id: '8',
			name: 'Armchair',
			position: { x: 15, y: -12 },
			dimensions: { length: 3, width: 3 },
			rotation: 30,
		},
		{
			id: '9',
			name: 'Side Table',
			position: { x: 18, y: -10 },
			dimensions: { length: 2, width: 2 },
			rotation: 0,
		},
		{
			id: '10',
			name: 'Floor Lamp',
			position: { x: 13, y: -14 },
			dimensions: { length: 1, width: 1 },
			rotation: 0,
		},
		// Bookshelf on bottom wall
		{
			id: '11',
			name: 'Bookshelf',
			position: { x: 0, y: -16 },
			dimensions: { length: 8, width: 2 },
			rotation: 0,
		},
		// TV stand opposite the bed
		{
			id: '12',
			name: 'TV Stand',
			position: { x: 0, y: -12 },
			dimensions: { length: 6, width: 2 },
			rotation: 0,
		},
		// Bench at foot of bed
		{
			id: '13',
			name: 'Storage Bench',
			position: { x: 0, y: 10 },
			dimensions: { length: 6, width: 2 },
			rotation: 0,
		},
		// Decorative plants
		{
			id: '14',
			name: 'Plant Stand',
			position: { x: -18, y: -14 },
			dimensions: { length: 1.5, width: 1.5 },
			rotation: 0,
		},
		{
			id: '15',
			name: 'Plant',
			position: { x: 10, y: 16 },
			dimensions: { length: 1, width: 1 },
			rotation: 0,
		},
		// Area rug (center of room)
		{
			id: '16',
			name: 'Area Rug',
			position: { x: 0, y: 2 },
			dimensions: { length: 12, width: 10 },
			rotation: 0,
		},
		// Ottoman
		{
			id: '17',
			name: 'Ottoman',
			position: { x: -8, y: -8 },
			dimensions: { length: 2.5, width: 2.5 },
			rotation: 45,
		},
		// Full-length mirror
		{
			id: '18',
			name: 'Mirror',
			position: { x: -15, y: -12 },
			dimensions: { length: 2, width: 0.5 },
			rotation: 0,
		},
	],
	openings: [
		{
			name: 'Main Door',
			wall_name: 'left',
			position: 5, // 5 units from center along the wall
			width: 3,
		},
		{
			name: 'Window 1',
			wall_name: 'back',
			position: -10,
			width: 4,
		},
		{
			name: 'Window 2',
			wall_name: 'back',
			position: 10,
			width: 4,
		},
		{
			name: 'Window 3',
			wall_name: 'right',
			position: 0,
			width: 5,
		},
	],
};

export default function RoomViewer({ roomData = sampleRoomData }: { roomData?: RoomData }) {
	const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
	const roomRef = useRef<HTMLDivElement>(null);

	const SCALE = 30; // pixels per unit
	const ROOM_LENGTH = roomData.room_dimensions.length;
	const ROOM_WIDTH = roomData.room_dimensions.width;
	const CENTER_X = ROOM_LENGTH / 2;
	const CENTER_Y = ROOM_WIDTH / 2;
	const OPENING_THICKNESS = 0.3; // thickness of the opening visual in room units

	// Convert center-based coordinates to absolute room coordinates
	const centerToAbsolute = (centerX: number, centerY: number) => ({
		x: CENTER_X + centerX,
		y: CENTER_Y + centerY,
	});

	// Convert absolute room coordinates to center-based coordinates
	const absoluteToCenter = (absX: number, absY: number) => ({
		x: absX - CENTER_X,
		y: absY - CENTER_Y,
	});

	// Generate consistent color based on object name
	const getColorForName = (name: string): string => {
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}

		const hue = Math.abs(hash % 360);
		const saturation = 65 + (Math.abs(hash) % 20);
		const lightness = 50 + (Math.abs(hash >> 8) % 15);

		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	};

	const handleRoomClick = (e: MouseEvent<HTMLDivElement>) => {
		if (!roomRef.current) return;
		const rect = roomRef.current.getBoundingClientRect();

		// Convert pixel coordinates to absolute room coordinates
		const absX = ((e.clientX - rect.left) / rect.width) * ROOM_LENGTH;
		const absY = ((rect.bottom - e.clientY) / rect.height) * ROOM_WIDTH;

		// Convert to center-based coordinates
		const centerCoords = absoluteToCenter(absX, absY);

		// Ensure coordinates are within bounds
		if (absX >= 0 && absX <= ROOM_LENGTH && absY >= 0 && absY <= ROOM_WIDTH) {
			setSelectedPoint({
				x: parseFloat(centerCoords.x.toFixed(2)),
				y: parseFloat(centerCoords.y.toFixed(2)),
			});
		}
	};

	// Calculate opening position and dimensions based on wall
	const getOpeningStyle = (opening: Opening) => {
		const isDoor = opening.name.toLowerCase().includes('door');
		const isWindow = opening.name.toLowerCase().includes('window');

		let style: React.CSSProperties = {};
		let labelStyle: React.CSSProperties = {};

		// Base colors
		const doorColor = '#8B4513'; // Brown for doors
		const windowColor = '#87CEEB'; // Sky blue for windows
		const defaultColor = '#666666'; // Gray for other openings

		const color = isDoor ? doorColor : isWindow ? windowColor : defaultColor;

		switch (opening.wall_name) {
			case 'front': // Bottom wall
				{
					const centerPos = centerToAbsolute(opening.position, 0);
					style = {
						left: `${(centerPos.x - opening.width / 2) * SCALE}px`,
						top: `${ROOM_WIDTH * SCALE}px`,
						width: `${opening.width * SCALE}px`,
						height: `${OPENING_THICKNESS * SCALE}px`,
						backgroundColor: color,
					};
					labelStyle = {
						top: `${OPENING_THICKNESS * SCALE + 2}px`,
					};
				}
				break;

			case 'back': // Top wall
				{
					const centerPos = centerToAbsolute(opening.position, 0);
					style = {
						left: `${(centerPos.x - opening.width / 2) * SCALE}px`,
						top: `${-OPENING_THICKNESS * SCALE}px`,
						width: `${opening.width * SCALE}px`,
						height: `${OPENING_THICKNESS * SCALE}px`,
						backgroundColor: color,
					};
					labelStyle = {
						bottom: `${OPENING_THICKNESS * SCALE + 2}px`,
					};
				}
				break;

			case 'left': // Left wall
				{
					const centerPos = centerToAbsolute(0, opening.position);
					style = {
						left: `${-OPENING_THICKNESS * SCALE}px`,
						top: `${(ROOM_WIDTH - centerPos.y - opening.width / 2) * SCALE}px`,
						width: `${OPENING_THICKNESS * SCALE}px`,
						height: `${opening.width * SCALE}px`,
						backgroundColor: color,
					};
					labelStyle = {
						right: `${OPENING_THICKNESS * SCALE + 2}px`,
						writingMode: 'vertical-rl' as const,
						textOrientation: 'mixed' as const,
					};
				}
				break;

			case 'right': // Right wall
				{
					const centerPos = centerToAbsolute(0, opening.position);
					style = {
						left: `${ROOM_LENGTH * SCALE}px`,
						top: `${(ROOM_WIDTH - centerPos.y - opening.width / 2) * SCALE}px`,
						width: `${OPENING_THICKNESS * SCALE}px`,
						height: `${opening.width * SCALE}px`,
						backgroundColor: color,
					};
					labelStyle = {
						left: `${OPENING_THICKNESS * SCALE + 2}px`,
						writingMode: 'vertical-rl' as const,
						textOrientation: 'mixed' as const,
					};
				}
				break;
		}

		return { style, labelStyle, color };
	};

	return (
		<div className="h-full w-full p-4 flex flex-col items-center justify-center bg-gray-100">
			<div className="border-4 border-gray-800 shadow-2xl relative">
				<div
					ref={roomRef}
					onClick={handleRoomClick}
					className="relative bg-gray-50 cursor-crosshair"
					style={{
						width: `${ROOM_LENGTH * SCALE}px`,
						height: `${ROOM_WIDTH * SCALE}px`,
					}}
				>
					{/* Grid lines */}
					<div className="absolute inset-0 pointer-events-none">
						{/* Vertical grid lines */}
						{Array.from({ length: ROOM_LENGTH + 1 }).map((_, i) => (
							<div
								key={`v-${i}`}
								className="absolute top-0 bottom-0 border-l border-gray-300"
								style={{ left: `${i * SCALE}px` }}
							/>
						))}
						{/* Horizontal grid lines */}
						{Array.from({ length: ROOM_WIDTH + 1 }).map((_, i) => (
							<div
								key={`h-${i}`}
								className="absolute left-0 right-0 border-t border-gray-300"
								style={{ top: `${i * SCALE}px` }}
							/>
						))}
					</div>

					{/* Room Objects */}
					{roomData.objects.map((obj) => {
						const color = getColorForName(obj.name);
						const absPos = centerToAbsolute(obj.position.x, obj.position.y);

						return (
							<div
								key={obj.id}
								className="absolute flex items-center justify-center pointer-events-none"
								style={{
									left: `${absPos.x * SCALE}px`,
									top: `${(ROOM_WIDTH - absPos.y) * SCALE}px`,
									width: `${obj.dimensions.length * SCALE}px`,
									height: `${obj.dimensions.width * SCALE}px`,
									transform: `translate(-50%, -50%) rotate(${obj.rotation}deg)`,
									backgroundColor: color,
									border: `2px solid ${color}`,
									filter: 'brightness(0.9)',
									opacity: 0.85,
								}}
							>
								<div className="text-white font-bold text-xs drop-shadow-md px-1">
									{obj.name}
								</div>
							</div>
						);
					})}

					{/* Openings (Doors & Windows) */}
					{roomData.openings?.map((opening, index) => {
						const { style, labelStyle, color } = getOpeningStyle(opening);
						const isDoor = opening.name.toLowerCase().includes('door');

						return (
							<div
								key={`opening-${index}`}
								className="absolute pointer-events-none"
								style={{
									...style,
									border: `2px solid ${color}`,
									filter: 'brightness(0.95)',
									opacity: 0.9,
									boxShadow: isDoor
										? 'inset 0 0 8px rgba(0,0,0,0.3)'
										: 'inset 0 0 10px rgba(255,255,255,0.5)',
								}}
							>
								<div
									className="absolute text-xs font-semibold whitespace-nowrap px-1"
									style={{
										...labelStyle,
										color: color,
										textShadow: '0 1px 2px rgba(255,255,255,0.8)',
									}}
								>
									{opening.name}
								</div>
							</div>
						);
					})}

					{/* Selected Point Marker */}
					{selectedPoint && (
						<div
							className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-red-700 shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse pointer-events-none z-50"
							style={{
								left: `${(CENTER_X + selectedPoint.x) * SCALE}px`,
								top: `${(ROOM_WIDTH - (CENTER_Y + selectedPoint.y)) * SCALE}px`,
							}}
						>
							{/* Red glow effect */}
							<div className="absolute inset-0 bg-red-500 rounded-full opacity-50 blur-sm scale-150" />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}