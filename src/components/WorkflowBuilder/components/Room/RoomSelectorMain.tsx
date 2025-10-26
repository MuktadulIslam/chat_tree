'use client';

import React, { useState, useRef, MouseEvent } from 'react';

interface Point {
  x: number;
  y: number;
}

export default function RoomSelector() {
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const roomRef = useRef<HTMLDivElement>(null);

  const ROOM_LENGTH = 40;
  const ROOM_WIDTH = 30;
  const SCALE = 30; // pixels per unit

  const handleRoomClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    
    // Convert pixel coordinates to room coordinates
    const roomX = parseFloat((((e.clientX - rect.left) / (rect.width)) * ROOM_LENGTH).toFixed(2));
    const roomY = parseFloat((((rect.bottom - e.clientY) / (rect.height)) * ROOM_WIDTH).toFixed(2)); // Invert Y axis

    // Ensure coordinates are within bounds
    if (roomX >= 0 && roomX <= ROOM_LENGTH && roomY >= 0 && roomY <= ROOM_WIDTH) {
      setSelectedPoint({ x: roomX, y: roomY });
    }
  };

  return (
    <div className="h-full w-full p-1 flex items-center justify-center">
      {/* Room */}
      <div className="border-4 border-gray-800">
        <div
          ref={roomRef}
          onClick={handleRoomClick}
          className="relative bg-gray-50"
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

          {/* Selected Point Marker */}
          {selectedPoint && (
            <div
              className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-red-700 shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{
                left: `${selectedPoint.x * SCALE}px`,
                top: `${(ROOM_WIDTH - selectedPoint.y) * SCALE}px`,
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