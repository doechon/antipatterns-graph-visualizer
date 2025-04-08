import { ReactflowNodeWithData } from "@/data-convert/types.ts";

export const getParentIdOfNode = ( { node, nodeMetrics }: { node: ReactflowNodeWithData, nodeMetrics: any } ) => {
  const parentId = Object.keys(nodeMetrics).sort().reduce(( acc, antipatternName ) => {
    if ( node.id in nodeMetrics[antipatternName] ) {
      if ( acc ) {
        return acc += ` x ${ antipatternName }`
      }
      return acc += antipatternName
    }
    return acc
  }, '')
  return parentId
}