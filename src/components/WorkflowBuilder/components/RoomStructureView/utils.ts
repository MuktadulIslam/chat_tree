import { RoomData } from "../../type/roomDataTypes";

export const sampleRoomData: RoomData = {
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
            dimensions: { length: 5, width: 4 },
            rotation: 0,
        },
        // Nightstands on both sides of bed
        {
            id: '2',
            name: 'Nightstand',
            position: { x: -6, y: 15 },
            dimensions: { length: 1.5, width: 1.5 },
            rotation: 0,
        },
        {
            id: '3',
            name: 'Nightstand',
            position: { x: 6, y: 15 },
            dimensions: { length: 1.5, width: 1.5 },
            rotation: 0,
        },
        // Dresser on left wall
        {
            id: '4',
            name: 'Dresser',
            position: { x: -20, y: 8 },
            dimensions: { length: 4, width: 2 },
            rotation: 0,
        },
        // Wardrobe on left wall
        {
            id: '5',
            name: 'Wardrobe',
            position: { x: -20, y: -5 },
            dimensions: { length: 4, width: 2 },
            rotation: 0,
        },
        // Desk and chair on right wall
        {
            id: '6',
            name: 'Desk',
            position: { x: 18, y: 10 },
            dimensions: { length: 4, width: 2 },
            rotation: 0,
        },
        {
            id: '7',
            name: 'Office Chair',
            position: { x: 18, y: 7 },
            dimensions: { length: 1.5, width: 1.5 },
            rotation: 0,
        },
        // Reading nook in corner
        {
            id: '8',
            name: 'Armchair',
            position: { x: 15, y: -12 },
            dimensions: { length: 2, width: 2 },
            rotation: 30,
        },
        {
            id: '9',
            name: 'Side Table',
            position: { x: 18, y: -10 },
            dimensions: { length: 1.5, width: 1.5 },
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
            dimensions: { length: 5, width: 2 },
            rotation: 0,
        },
        // TV stand opposite the bed
        {
            id: '12',
            name: 'TV Stand',
            position: { x: 0, y: -12 },
            dimensions: { length: 4, width: 2 },
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
            dimensions: { length: 6, width: 4 },
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