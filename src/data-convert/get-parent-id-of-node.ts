import { ReactflowNodeWithData } from "@/data-convert/types.ts";

export const getParentIdOfNode = ( { node, activeAntiPatterns }: {
  node: ReactflowNodeWithData,
  activeAntiPatterns: any
} ) => {
  const parentId = Object.keys(activeAntiPatterns).sort().reduce(( acc, antipatternName ) => {
    if ( node.id in activeAntiPatterns[antipatternName] || (Array.isArray(activeAntiPatterns[antipatternName]) && activeAntiPatterns[antipatternName].includes(node.id)) ) {
      if ( acc ) {
        return acc += ` x ${ antipatternName }`
      }
      return acc += antipatternName
    }
    return acc
  }, '')
  return parentId
}