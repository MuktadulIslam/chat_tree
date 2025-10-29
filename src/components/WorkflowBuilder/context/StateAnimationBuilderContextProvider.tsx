'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'
import { State } from '../type/stateAnimationBuilderDataType'


interface StateAnimationBuilderContexType {
    states: State[]
    setStates: React.Dispatch<React.SetStateAction<State[]>>
}

const StateAnimationBuilderContex = createContext<StateAnimationBuilderContexType | undefined>(undefined)

export const useStateAnimationBuilder = () => {
    const context = useContext(StateAnimationBuilderContex)
    if (!context) {
        throw new Error('useWorkflow must be used within a WorkflowProvider')
    }
    return context
}

export default function StateAnimationBuilderContextProvider({ children }: { children: ReactNode }) {
    const [states, setStates] = useState<State[]>([]);

    const value: StateAnimationBuilderContexType = {
        states,
        setStates
    }

    return (
        <StateAnimationBuilderContex.Provider value={value}>
            {children}
        </StateAnimationBuilderContex.Provider>
    );
}