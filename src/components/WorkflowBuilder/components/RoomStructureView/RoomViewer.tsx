'use client';
import React, { MouseEvent } from 'react';
import { Opening, Point, } from '../../type/roomDataTypes';
import { useRoom } from '../../context/RoomContextProvider';
import { TbArrowBigRightFilled } from "react-icons/tb";



export default function RoomViewer() {
	const {
		roomData,
		selectedPoint,
		selectedStateName,
		previousPoint,
		roomRef,
		SCALE,
		ROOM_LENGTH,
		ROOM_WIDTH,
		CENTER_X,
		CENTER_Y,
		OPENING_THICKNESS,
		setSelectedPoint
	} = useRoom();



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
		if (!roomRef.current || !selectedStateName) return;
		const rect = roomRef.current.getBoundingClientRect();

		// Convert pixel coordinates to absolute room coordinates
		const absX = ((e.clientX - rect.left) / rect.width) * ROOM_LENGTH;
		const absY = ((rect.bottom - e.clientY) / rect.height) * ROOM_WIDTH;

		// Convert to center-based coordinates
		const centerCoords = absoluteToCenter(absX, absY);

		// Ensure coordinates are within bounds
		if (absX >= 0 && absX <= ROOM_LENGTH && absY >= 0 && absY <= ROOM_WIDTH) {
			const newPoint: Point = {
				x: parseFloat(centerCoords.x.toFixed(2)),
				y: parseFloat(centerCoords.y.toFixed(2)),
				selected_for: selectedStateName,
				animation_type: null,
				rotation: selectedPoint?.rotation ?? 0
			};
			setSelectedPoint(newPoint);
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
					{roomData?.objects.map((obj) => {
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
					{roomData?.openings?.map((opening, index) => {
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

					{/* Previous Point Marker (Green) */}
					{previousPoint && (
						<div
							className="absolute w-5 h-5 bg-green-500 rounded-full border-2 border-green-700 shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-40 cursor-pointer"
							style={{
								left: `${(CENTER_X + previousPoint.x) * SCALE}px`,
								top: `${(ROOM_WIDTH - (CENTER_Y + previousPoint.y)) * SCALE}px`,
							}}
						>
							<TbArrowBigRightFilled size={16} style={{
								transform: `rotate(${previousPoint.rotation}deg)`,
								zIndex: 60
							}} />

							<div className="absolute inset-0 bg-green-500 rounded-full opacity-50 blur-sm scale-150" />
							<div className="max-w-44 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white border-2 border-green-700 rounded shadow-lg px-2 py-0.5 whitespace-nowrap z-50">
								<div className="w-full overflow-hidden text-sm font-bold text-gray-800">{previousPoint.selected_for}</div>
								<div className="w-full overflow-hidden text-xs font-semibold text-gray-800">{previousPoint.roadmap_node}</div>
								{previousPoint.animation_type && (
									<div className="text-xs text-gray-500 italic mb-1">
										{`${previousPoint.animation_type} Animation`}
									</div>
								)}
								<div className="text-xs text-gray-600 mb-1">
									({previousPoint.x}, {previousPoint.y})
								</div>
								{/* Arrow pointing down */}
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-green-700" />
							</div>
						</div>
					)}

					{/* Selected Point Marker (Blue) */}
					{selectedPoint && (
						<div
							className="absolute w-5 h-5 bg-blue-500 rounded-full border-2 border-blue-700 shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse pointer-events-auto z-50 cursor-pointer flex justify-center items-center"
							style={{
								left: `${(CENTER_X + selectedPoint.x) * SCALE}px`,
								top: `${(ROOM_WIDTH - (CENTER_Y + selectedPoint.y)) * SCALE}px`,
							}}
						>
							<TbArrowBigRightFilled size={16} style={{
								transform: `rotate(${selectedPoint.rotation}deg)`,
								zIndex: 60
							}} />

							<div className="absolute inset-0 bg-blue-500 rounded-full opacity-50 blur-sm scale-150" />
							<div className="max-w-44 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white border-2 border-blue-700 rounded shadow-lg px-2 py-0.5 whitespace-nowrap z-50">
								<div className="w-full overflow-hidden text-sm font-bold text-gray-800">{selectedPoint.selected_for}</div>
								<div className="w-full overflow-hidden text-xs font-semibold text-gray-800">{selectedPoint.roadmap_node}</div>
								{selectedPoint.animation_type && (
									<div className="text-xs text-gray-500 italic mb-1">
										{`${selectedPoint.animation_type} Animation`}
									</div>
								)}
								<div className="text-xs text-gray-600 mb-1">
									{`(${selectedPoint.x}, ${selectedPoint.y}, ${selectedPoint.rotation}°)`}
								</div>
								{/* Arrow pointing down */}
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-700" />
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}