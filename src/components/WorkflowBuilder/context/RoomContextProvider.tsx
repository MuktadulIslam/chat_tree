'use client';
import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Point, RoomData } from '../type/roomDataTypes';

interface RoomContextType {
    roomData: RoomData | null;
    selectedPoint: Point | null;
    selectedStateName: string | null
    previousPoint: Point | null;
    roomRef: React.RefObject<HTMLDivElement | null>;
    setSelectedPoint: React.Dispatch<React.SetStateAction<Point | null>>;
    setSelectedStateName: React.Dispatch<string | null>;
    setPreviousPoint: React.Dispatch<React.SetStateAction<Point | null>>;
    setRoomData: React.Dispatch<React.SetStateAction<RoomData | null>>;

    SCALE: number;
    ROOM_LENGTH: number;
    ROOM_WIDTH: number;
    CENTER_X: number;
    CENTER_Y: number;
    OPENING_THICKNESS: number;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoom = () => {
    const context = useContext(RoomContext);
    if (!context) {
        throw new Error('useRoom must be used within a RoomProvider');
    }
    return context;
};

interface RoomProviderProps {
    children: ReactNode;
    initialRoomData?: RoomData;
}

export default function RoomContextProvider({ children, initialRoomData }: RoomProviderProps) {
    const [roomData, setRoomData] = useState<RoomData | null>(initialRoomData || null);
    const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
    const [previousPoint, setPreviousPoint] = useState<Point | null>(null);
    const [selectedStateName, setSelectedStateName] = useState<string | null>(null);
    const roomRef = useRef<HTMLDivElement>(null);

    const SCALE = 40; // pixels per unit
    const ROOM_LENGTH = roomData?.room_dimensions.length || 0;
    const ROOM_WIDTH = roomData?.room_dimensions.width || 0;
    const CENTER_X = ROOM_LENGTH / 2;
    const CENTER_Y = ROOM_WIDTH / 2;
    const OPENING_THICKNESS = 0.3; // thickness of the opening visual in room units

    const value: RoomContextType = {
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
        setSelectedPoint,
        setSelectedStateName,
        setPreviousPoint,
        setRoomData
    };

    return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};