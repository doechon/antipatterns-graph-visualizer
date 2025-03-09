import { lastOf } from "@/utils/base";
import { Data, Reactflow, Workflow } from "./types";

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

export const workflow2reactflow = ( workflow: Workflow & { bottleneckStatistics?: boolean } ): Reactflow => {
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

  return {
    nodes: nodes.filter(node => node.id === 'bottleneck' || node.id in analysis.bottlenecks).map(( node ) => (
      {
        ...node,
        data: {
          ...node,
          sourceHandles: Object.keys(nodeHandles[node.id]?.sourceHandles ?? []),
          targetHandles: Object.keys(nodeHandles[node.id]?.targetHandles ?? []),
          bottleneckPercent: node.id in analysis.bottlenecks && workflow.bottleneckStatistics ? analysis.bottlenecks[node.id] : void 0,
          tooltip: { label: node.id in analysis.bottlenecks && workflow.bottleneckStatistics ? `BottleneckPercent: ${ analysis.bottlenecks[node.id] }` : void 0 },
        },
        position: { x: 0, y: 0 },
        parentId: node.id in analysis.bottlenecks ? 'bottleneck' : void 0,
        type: node.type,
        extent: node.id in analysis.bottlenecks ? 'parent' : void 0,
      })),
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
  };
};
