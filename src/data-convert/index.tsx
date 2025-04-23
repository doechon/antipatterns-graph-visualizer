import { lastOf } from "@/utils/base";
import { Data, Reactflow, ReactflowNodeWithData, Workflow } from "./types";
import { getGroupNodes } from "@/data-convert/get-group-nodes.ts";
import { ReactflowLayoutConfig } from "@/layout/node";
import { getActiveAntiPatternToggleNames } from "@/data-convert/get-active-anti-pattern-toggle-names.ts";
import { getParentIdOfNode } from "@/data-convert/get-parent-id-of-node.ts";

export const convertData2Workflow = ( data: Data ): Workflow => {
  const edgesCount: Record<string, number> = {};
  const preparedEdges: Workflow['edges'] = []
  for ( const edge of data["dependencyGraph"]['edges'] ) {
    const edgeId = `${ edge.source }#${ edge.target }`
    if ( !edgesCount[edgeId] ) {
      edgesCount[edgeId] = 1
    } else {
      edgesCount[edgeId]++
    }
    const count = edgesCount[edgeId]
    preparedEdges.push({
      id: `${ edgeId }#${ count }`,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      sourceHandle: `${ edge.source }#source#${ count }`,
      targetHandle: `${ edge.target }#target#${ count }`
    })
  }

  return {
    nodes: data["dependencyGraph"]['nodes'].map(node => {
      return ({
        id: node.id,
        type: [ 'group' ].includes(node.type) ? node.type : 'base'
      })
    }),
    edges: preparedEdges,
    analysis: data["architectureAnalysis"]
  }
}

export const workflow2reactflow = ( { workflow, config }: {
  workflow: Workflow,
  config: ReactflowLayoutConfig
} ): Reactflow => {
  const { nodes = [], edges = [], analysis } = workflow ?? {};
  const edgesCount: Record<string, number> = {};
  const edgesIndex: Record<string, { source: number; target: number }> = {};
  const nodeHandles: Record<
    string,
    {
      sourceHandles: Record<string, number>;
      targetHandles: Record<string, number>;
    }
  > = {};

  for ( const edge of edges ) {
    const { source, target, sourceHandle, targetHandle } = edge;
    for ( const i of [ sourceHandle, targetHandle, `source-${ source }`, `target-${ target }` ] ) {
      if ( !edgesCount[i] ) {
        edgesCount[i] = 1;
      } else {
        edgesCount[i] += 1;
      }
    }

    edgesIndex[edge.id] = {
      source: edgesCount[sourceHandle] - 1,
      target: edgesCount[targetHandle] - 1,
    };

    if ( !nodeHandles[source] ) {
      nodeHandles[source] = { sourceHandles: {}, targetHandles: {} };
    }
    if ( !nodeHandles[target] ) {
      nodeHandles[target] = { sourceHandles: {}, targetHandles: {} };
    }

    if ( !nodeHandles[source].sourceHandles[sourceHandle] ) {
      nodeHandles[source].sourceHandles[sourceHandle] = 1;
    } else {
      nodeHandles[source].sourceHandles[sourceHandle] += 1;
    }

    if ( !nodeHandles[target].targetHandles[targetHandle] ) {
      nodeHandles[target].targetHandles[targetHandle] = 1;
    } else {
      nodeHandles[target].targetHandles[targetHandle] += 1;
    }
  }

  let activeAntiPatternToggleNames = getActiveAntiPatternToggleNames(config.toggles)

  const nodeMetrics = Object.entries(analysis).reduce(( acc, [ antipatternName, data ] ) => {
    if ( activeAntiPatternToggleNames.includes(antipatternName) && typeof data === 'object' && typeof Object.values(data)[0] === 'number' ) {
      return { ...acc, [antipatternName]: data }
    }
    return acc
  }, {})

  const edgeHighlight = Object.entries(analysis).reduce(( acc, [ antipatternName, data ] ) => {
    if ( activeAntiPatternToggleNames.includes(antipatternName) && typeof data === 'object' && Array.isArray(Object.values(data)[0]) ) {
      return { ...acc, ...data }
    }
    return acc
  }, {})

  const activeAntiPatterns = Object.assign({}, nodeMetrics, edgeHighlight)

  activeAntiPatternToggleNames = Object.keys(activeAntiPatterns)

  const parentIds = Array.from(new Set(nodes.map(( node ) => getParentIdOfNode({ node, activeAntiPatterns }))))

  const groupNodes = getGroupNodes({ activeToggles: activeAntiPatternToggleNames, parentIds })

  return {
    nodes: groupNodes.concat(nodes.filter(node => getParentIdOfNode({
      node,
      activeAntiPatterns
    })).reduce(( acc, node ) => {
      const stats = activeAntiPatternToggleNames.reduce(( acc, cur ) => {
        if ( analysis[cur] && node.id in analysis[cur] ) {
          return { ...acc, [cur]: analysis[cur][node.id] }
        }
        return acc
      }, {})


      const nodeMetricArr = Object.values(stats)
      let nodeMetricPercent = (nodeMetricArr.reduce(( a, b ) => a + b, 0) / nodeMetricArr.length);

      nodeMetricPercent = (Math.round(nodeMetricPercent * 100) / 100).toFixed(2);

      let label = Object.entries(stats).reduce(( acc, curVal ) => {
        if ( curVal[1] ) {
          return acc += `${ curVal[0] }: ${ Number(curVal[1]) * 100 }%`
        }
        return acc
      }, '')

      if ( nodeMetricArr.length > 1 ) {
        label += `total ${ nodeMetricPercent * 100 }%`
      }

      acc.push({
        ...node,
        data: {
          ...node,
          sourceHandles: Object.keys(nodeHandles[node.id]?.sourceHandles ?? []),
          targetHandles: Object.keys(nodeHandles[node.id]?.targetHandles ?? []),
          tooltip: { label: label ? label : void 0 },
          nodeMetricPercent,
        },
        position: { x: 0, y: 0 },
        parentId: getParentIdOfNode({ node, activeAntiPatterns }) ?? void 0,
        type: node.type,
        extent: node.type === 'base' ? 'parent' : void 0,
      })
      return acc
    }, [] as ReactflowNodeWithData[]) ?? []) ?? [],
    edges: edges.map(( edge ) => ({
      ...edge,
      label: edge.type,
      data: {
        sourcePort: {
          edges: edgesCount[`source-${ edge.source }`],
          portIndex: parseInt(lastOf(edge.sourceHandle.split("#"))!, 10),
          portCount: Object.keys(nodeHandles[edge.source].sourceHandles).length,
          edgeIndex: edgesIndex[edge.id].source,
          edgeCount: edgesCount[edge.sourceHandle],
        },
        targetPort: {
          edges: edgesCount[`target-${ edge.target }`],
          portIndex: parseInt(lastOf(edge.targetHandle.split("#"))!, 10),
          portCount: Object.keys(nodeHandles[edge.target].targetHandles).length,
          edgeIndex: edgesIndex[edge.id].target,
          edgeCount: edgesCount[edge.targetHandle],
        },
      },
    })),
    toggleNames: Object.keys(analysis)
  };
};
