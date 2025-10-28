import { NodeTypes, type Node } from '@xyflow/react'
import StartNode from '../components/nodes/StartNode'
import EndNode from '../components/nodes/EndNode'
import StateNode from '../components/nodes/StateNode'
import CriteriaNode from '../components/nodes/CriteriaNode'

export type ImportanceLevel = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
export type NodeType = 'start' | 'end' | 'state' | 'criteria'

export interface Example {
  text: string
  importance: ImportanceLevel
}

export interface SubCriteria {
  id: string
  name: string
  examples: Example[]
}

export interface AnimationsType {
  pre: boolean
  during: boolean
  post: boolean
}

export interface NodeData {
  label: string
  selected?: boolean
  examples?: Example[]
  currentInput?: string
  personality?: 'Angry' | 'Annoyed' | 'Neutral' | 'Content' | 'Happy'
  context?: string
  retryCount?: number
  exemplars?: string[]
  subCriterias?: SubCriteria[]
  currentSubCriteriaInput?: string
  animations_type_has?: AnimationsType
  [key: string]: unknown
}

export type StartNodeData = NodeData;
export interface EndNodeData extends NodeData {
  personality: 'Angry' | 'Annoyed' | 'Neutral' | 'Content' | 'Happy'
  context: string
  animations_type_has: AnimationsType
}
export interface StateNodeData extends NodeData {
  personality: 'Angry' | 'Annoyed' | 'Neutral' | 'Content' | 'Happy'
  context: string
  retryCount: number
  exemplars: string[]
  animations_type_has: AnimationsType
}
export interface CriteriaNodeData extends NodeData {
  subCriterias: SubCriteria[]
}

export type CustomNode = Node<NodeData>

export const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  state: StateNode,
  criteria: CriteriaNode,
}