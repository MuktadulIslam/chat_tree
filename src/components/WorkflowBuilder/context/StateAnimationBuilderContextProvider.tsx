'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'
import { State, WorkFlow } from '../type/stateAnimationBuilderDataType'


interface StateAnimationBuilderContextType {
    states: State[]
    setStates: React.Dispatch<React.SetStateAction<State[]>>
    workflows: WorkFlow[]
    setWorkflows: React.Dispatch<React.SetStateAction<WorkFlow[]>>
    selectedStatesForAnimation: State | null
    setSelectedStatesForAnimation: React.Dispatch<React.SetStateAction<State | null>>
}

const StateAnimationBuilderContext = createContext<StateAnimationBuilderContextType | undefined>(undefined)

export const useStateAnimationBuilder = () => {
    const context = useContext(StateAnimationBuilderContext)
    if (!context) {
        throw new Error('useStateAnimationBuilder must be used within a StateAnimationBuilderContextProvider')
    }
    return context
}

export default function StateAnimationBuilderContextProvider({ children }: { children: ReactNode }) {
    const [states, setStates] = useState<State[]>([]);
    const [workflows, setWorkflows] = useState<WorkFlow[]>([]);
    const [selectedStatesForAnimation, setSelectedStatesForAnimation] = useState<State | null>(null);

    const value: StateAnimationBuilderContextType = {
        states,
        setStates,
        workflows,
        setWorkflows,
        selectedStatesForAnimation,
        setSelectedStatesForAnimation
    }

    return (
        <StateAnimationBuilderContext.Provider value={value}>
            {children}
        </StateAnimationBuilderContext.Provider>
    );
}