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
    if ( !edgesCount[edge] ) {
      edgesCount[edge] = 0
    } else {
      edgesCount[edge]++
    }
    const count = edgesCount[edge]
    preparedEdges.push({
      id: `${ edge.source }#${ edge.target }#${ count }`,
      source: edge.source,
      target: edge.target,
      sourceHandle: `${ edge.source }#source#${ count }`,
      targetHandle: `${ edge.target }#target#0`
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

  const activeAntiPatternToggleNames = getActiveAntiPatternToggleNames(config.toggles)

  const nodeMetrics = Object.entries(analysis).reduce(( acc, [ antipatternName, data ] ) => {
    if ( typeof data === 'object' && typeof Object.values(data)[0] === 'number' && activeAntiPatternToggleNames.includes(antipatternName) ) {
      return { ...acc, [antipatternName]: data }
    }
    return acc
  }, {})

  const parentIds = Array.from(new Set(nodes.map(( node ) => getParentIdOfNode({ node, nodeMetrics }))))

  const groupNodes = getGroupNodes({ activeToggles: activeAntiPatternToggleNames, parentIds })

  return {
    nodes: groupNodes.concat(nodes.filter(node => getParentIdOfNode({ node, nodeMetrics })).reduce(( acc, node ) => {
      const stats = activeAntiPatternToggleNames.reduce(( acc, cur ) => {
        console.log('cur', cur)
        console.log('analysis[cur]', analysis[cur])
        console.log('node.id', node.id)
        if ( analysis[cur] && node.id in analysis[cur] ) {
          console.log('analysis[cur][node.id]', analysis[cur][node.id])
          return { ...acc, [cur]: analysis[cur] }
        }
        return acc
      }, {})

      console.log('stats', stats)

      // const label = Object.entries(stats).reduce(( acc, curVal ) => {
      //   if ( curVal[1] ) {
      //     return acc += `${ curVal[0] }: ${ Number(curVal[1]) * 100 }%`
      //   }
      //   return acc
      // }, '')
      if ( workflow.toggles !== void 0 && Object.keys(workflow.toggles).length > 0 && !(Object.keys(workflow.toggles).includes(node.id)) && Object.values(stats).every(x => x === void 0) ) {
        return acc
      }
      acc.push({
        ...node,
        data: {
          ...node,
          sourceHandles: Object.keys(nodeHandles[node.id]?.sourceHandles ?? []),
          targetHandles: Object.keys(nodeHandles[node.id]?.targetHandles ?? []),
          // tooltip: { label: label ? label : void 0 },
        },
        position: { x: 0, y: 0 },
        parentId: getParentIdOfNode({ node, nodeMetrics }) ?? void 0,
        type: node.type,
        extent: node.type === 'base' ? 'parent' : void 0,
      })
      return acc
    }, [] as ReactflowNodeWithData[]) ?? []) ?? [],
    edges: edges.map(( edge ) => ({
      ...edge,
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
