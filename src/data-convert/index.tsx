import { Data, Reactflow, ReactflowNodeData, ReactflowNodeWithData, Workflow } from "./types";
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

export const workflow2reactflow = ( { workflow, config }: {
  workflow: Workflow,
  config: ReactflowLayoutConfig
} ): Reactflow => {
  const { nodes: workflowNodes = [], analysis: antiPatterns } = workflow ?? {};
  let activeAntiPatternToggleNames = getActiveAntiPatternToggleNames(config.toggles)

  const activeAntiPatterns = Object.fromEntries(Object.entries(antiPatterns).filter((( [ antiPatternName ] ) => activeAntiPatternToggleNames.includes(antiPatternName))))

  activeAntiPatternToggleNames = Object.keys(activeAntiPatterns)

  const parentIds = Array.from(new Set(workflowNodes.map(( node ) => getParentIdOfNode({ node, activeAntiPatterns }))))

  const groupNodes = getGroupNodes({ activeToggles: activeAntiPatternToggleNames, parentIds })

  const {
    edges,
    nodeHandles
  } = getEdgesAndNodeHandles(antiPatterns)

  const nodes = groupNodes.concat(workflowNodes.filter(node => getParentIdOfNode({
    node,
    activeAntiPatterns
  })).reduce(( acc, node, ind ) => {
    const stats: ReactflowNodeData['stats'] = activeAntiPatternToggleNames.reduce(( acc, cur ) => {
      const data = activeAntiPatterns[cur]["metric"]
      if ( data && node.id in data ) {
        return [ ...acc, { antiPatternName: cur, value: data[node.id] * 100 } ]
      }
      return acc
    }, [])


    const nodeMetricArr = Object.values(stats).map(i => i.value)
    let nodeMetricPercent = (nodeMetricArr.reduce(( a, b ) => +a + +b, 0) / nodeMetricArr.length);
    nodeMetricPercent = (Math.round(nodeMetricPercent * 100) / 100).toFixed(2);

    // let label = Object.entries(stats).reduce(( acc, curVal ) => {
    //   if ( curVal[1] ) {
    //     return acc += `${ curVal[0] }: ${ Number(curVal[1]) * 100 }%`
    //   }
    //   return acc
    // }, '')


    if ( nodeMetricArr.length > 1 ) {
      stats.push({ antiPatternName: 'Total', value: nodeMetricPercent })
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
    antiPatternToggles: Object.entries(antiPatterns).map(( [ name, { topological, metric } ] ) => ({
      name,
      disabled: topological === undefined || metric === undefined
    }))
  };
};
