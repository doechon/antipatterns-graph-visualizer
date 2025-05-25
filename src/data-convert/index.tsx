import { AnalysisEdge, Data, Reactflow, ReactflowNodeData, ReactflowNodeWithData, Workflow } from "./types";
import { getGroupNodes } from "@/data-convert/get-group-nodes.ts";
import { ReactflowLayoutConfig } from "@/layout/node";
import { getActiveAntiPatternToggleNames } from "@/data-convert/get-active-anti-pattern-toggle-names.ts";
import { getParentIdOfNode } from "@/data-convert/get-parent-id-of-node.ts";
import { getEdgesAndNodeHandles } from "@/data-convert/get-edges-and-node-handles.ts";

export const convertData2Workflow = ( data: Data ): Workflow => {
  return {
    nodes: data["dependencyGraph"]['nodes'].map(node => {
      return ({
        id: node.id,
        type: 'base'
      })
    }),
    edges: [],
    analysis: data["architectureAnalysis"]
  }
}

export enum AntiPatternType {
  NOT_FOUND = "not_found",
  NODE_METRIC = "node_metric",
  EDGE_HIGHLIGHT = "edge_highlight"
}

export type AntiPatterns = Record<string, {
  type: AntiPatternType.EDGE_HIGHLIGHT,
  data: { [key: string]: AnalysisEdge[] }
} | {
  type: AntiPatternType.NODE_METRIC,
  data: { [key: string]: number }
} | {
  type: AntiPatternType.NOT_FOUND,
}>

export const workflow2reactflow = ( { workflow, config }: {
  workflow: Workflow,
  config: ReactflowLayoutConfig
} ): Reactflow => {
  const { nodes: workflowNodes = [], analysis } = workflow ?? {};
  let activeAntiPatternToggleNames = getActiveAntiPatternToggleNames(config.toggles)

  const antiPatterns: AntiPatterns = Object.entries(analysis).reduce(( acc, [ antipatternName, data ] ) => {
    let type = 'not_found'
    if ( typeof data === 'object' && typeof Object.values(data)[0] === 'number' ) {
      type = 'node_metric'
    } else if ( typeof data === 'object' && Array.isArray(Object.values(data)[0]) ) {
      type = 'edge_highlight'
    }
    return { ...acc, [antipatternName]: { type, data: data } }
  }, {})

  const activeAntiPatterns = Object.fromEntries(Object.entries(antiPatterns).filter((( [ antiPatternName ] ) => activeAntiPatternToggleNames.includes(antiPatternName))))

  activeAntiPatternToggleNames = Object.keys(activeAntiPatterns)

  const parentIds = Array.from(new Set(workflowNodes.map(( node ) => getParentIdOfNode({ node, activeAntiPatterns }))))

  const groupNodes = getGroupNodes({ activeToggles: activeAntiPatternToggleNames, parentIds })

  const {
    edges,
    nodeHandles
  } = getEdgesAndNodeHandles(
    Object.fromEntries(Object.entries(antiPatterns).filter((( [ antiPatternName, { type } ] ) => activeAntiPatternToggleNames.includes(antiPatternName) && type === 'edge_highlight'))))

  const nodes = groupNodes.concat(workflowNodes.filter(node => getParentIdOfNode({
    node,
    activeAntiPatterns
  })).reduce(( acc, node, ind ) => {
    const stats: ReactflowNodeData['stats'] = activeAntiPatternToggleNames.reduce(( acc, cur ) => {
      if ( analysis[cur] && node.id in analysis[cur] ) {
        return [ ...acc, { antiPatternName: cur, value: analysis[cur][node.id] * 100 } ]
      }
      return acc
    }, [])


    const nodeMetricArr = Object.values(stats).map(i => i.value)
    let nodeMetricPercent = (nodeMetricArr.reduce(( a, b ) => a + b, 0) / nodeMetricArr.length);

    nodeMetricPercent = (Math.round(nodeMetricPercent * 100) / 100).toFixed(2);

    // let label = Object.entries(stats).reduce(( acc, curVal ) => {
    //   if ( curVal[1] ) {
    //     return acc += `${ curVal[0] }: ${ Number(curVal[1]) * 100 }%`
    //   }
    //   return acc
    // }, '')


    if ( nodeMetricArr.length > 1 ) {
      stats.push({ antiPatternName: 'Total', value: nodeMetricPercent * 100 })
    }


    acc.push({
      ...node,
      data: {
        ...node,
        sourceHandles: Object.keys(nodeHandles[node.id]?.sourceHandles ?? []),
        targetHandles: Object.keys(nodeHandles[node.id]?.targetHandles ?? []),
        stats,
        nodeMetricPercent,
      },
      sourceHandles: Object.keys(nodeHandles[node.id]?.sourceHandles ?? []),
      targetHandles: Object.keys(nodeHandles[node.id]?.targetHandles ?? []),
      position: { x: 40 * ind, y: 150 * ind },
      parentId: getParentIdOfNode({ node, activeAntiPatterns }) ?? void 0,
      type: node.type,
      extent: node.type === 'base' ? 'parent' : void 0,
    })
    return acc
  }, [] as ReactflowNodeWithData[]) ?? []) ?? []


  return {
    nodes,
    edges,
    antiPatternToggles: Object.entries(antiPatterns).map(( [ name, { type } ] ) => ({ name, type }))
  };
};
