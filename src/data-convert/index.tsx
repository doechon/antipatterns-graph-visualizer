import { Data, Reactflow, ReactflowNodeData, ReactflowNodeWithData, Workflow } from "./types";
import { getGroupNodes } from "@/data-convert/get-group-nodes.ts";
import { ReactflowLayoutConfig } from "@/layout/node";
import { getActiveAntiPatternToggleNames } from "@/data-convert/get-active-anti-pattern-toggle-names.ts";
import { getParentIdOfNode } from "@/data-convert/get-parent-id-of-node.ts";
import { isEmpty } from 'lodash'
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

export const workflow2reactflow = ( { workflow, config }: {
  workflow: Workflow,
  config: ReactflowLayoutConfig
} ): Reactflow => {
  const { nodes: workflowNodes = [], analysis } = workflow ?? {};
  let activeAntiPatternToggleNames = getActiveAntiPatternToggleNames(config.toggles)

  const nodeMetrics = Object.entries(analysis).reduce(( acc, [ antipatternName, data ] ) => {
    if ( typeof data === 'object' && typeof Object.values(data)[0] === 'number' ) {
      return { ...acc, [antipatternName]: data }
    }
    return acc
  }, {})

  const edgeHighlight = Object.entries(analysis).reduce(( acc, [ antipatternName, data ] ) => {
    if ( typeof data === 'object' && Array.isArray(Object.values(data)[0]) ) {
      return { ...acc, [antipatternName]: data }
    }
    return acc
  }, {})

  const notFoundAntiPatterns = Object.entries(analysis).reduce(( acc, [ antipatternName, data ] ) => {
    if ( typeof data === 'object' && isEmpty(data) ) {
      return { ...acc, [antipatternName]: data }
    }
    return acc
  }, {})

  const activeAntiPatterns = Object.fromEntries(Object.entries(Object.assign({}, nodeMetrics, edgeHighlight)).filter((( [ antiPatternName ] ) => activeAntiPatternToggleNames.includes(antiPatternName))))

  activeAntiPatternToggleNames = Object.keys(activeAntiPatterns)

  const parentIds = Array.from(new Set(workflowNodes.map(( node ) => getParentIdOfNode({ node, activeAntiPatterns }))))

  const groupNodes = getGroupNodes({ activeToggles: activeAntiPatternToggleNames, parentIds })

  const {
    edges,
    nodeHandles
  } = getEdgesAndNodeHandles(
    Object.fromEntries(Object.entries(edgeHighlight).filter((( [ antiPatternName ] ) => activeAntiPatternToggleNames.includes(antiPatternName)))))

  const nodes = groupNodes.concat(workflowNodes.filter(node => getParentIdOfNode({
    node,
    activeAntiPatterns
  })).reduce(( acc, node ) => {
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
      position: { x: 0, y: 0 },
      parentId: getParentIdOfNode({ node, activeAntiPatterns }) ?? void 0,
      type: node.type,
      extent: node.type === 'base' ? 'parent' : void 0,
    })
    return acc
  }, [] as ReactflowNodeWithData[]) ?? []) ?? []
  
  return {
    nodes,
    edges,
    toggleNames: Object.keys(analysis),
    summary: {
      nodeMetrics: Object.entries(nodeMetrics).map(( [ key, val ] ) => ({
        antiPatternName: key,
        value: Object.keys(val).length
      })),
      edgeHighlight: Object.entries(edgeHighlight).map(( [ key, val ] ) => ({
        antiPatternName: key,
        value: Object.keys(val).length
      })),
      notFoundAntiPatterns: Object.entries(notFoundAntiPatterns).map(( [ key, val ] ) => ({
        antiPatternName: key,
        value: Object.keys(val).length
      })),
    }
  };
};
