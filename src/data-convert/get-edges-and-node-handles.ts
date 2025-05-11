import { lastOf } from "@/utils/base.ts";
import { AnalysisEdge, Workflow } from "@/data-convert/types.ts";

export interface getEdgesReturn {
  edges: Workflow["edges"]
  nodeHandles: Record<
    string,
    {
      sourceHandles: Record<string, number>;
      targetHandles: Record<string, number>;
    }
  >
}

export const getEdgesAndNodeHandles = ( edgeHighlightAntipaterns: {
  [antiPatternName: string]: { [antiPatternItemName: string]: AnalysisEdge[] }
} ): getEdgesReturn => {
  const baseEdgesCount: Record<string, number> = {};
  const preparedEdges: Workflow['edges'] = []

  const analysisEdges: AnalysisEdge[] = [];

  // Iterate through each anti-pattern category (Cycles, Service chains)
  Object.values(edgeHighlightAntipaterns).forEach(category => {
    // Iterate through each item in the category (Cycle 1, Chain--1948439031, etc.)
    Object.values(category).forEach(itemEdges => {
      analysisEdges.push(...itemEdges);
    });
  });

  for ( const edge of analysisEdges ) {
    const [ source, target, type ] = edge
    const edgeId = `${ source }#${ target }`
    if ( !baseEdgesCount[edgeId] ) {
      baseEdgesCount[edgeId] = 1
    } else {
      baseEdgesCount[edgeId]++
    }
    const count = baseEdgesCount[edgeId]
    preparedEdges.push({
      id: `${ edgeId }#${ count }`,
      source,
      target,
      type,
      sourceHandle: `${ source }#source#${ count }`,
      targetHandle: `${ target }#target#${ count }`
    })
  }


  const edgesCount: Record<string, number> = {};
  const edgesIndex: Record<string, { source: number; target: number }> = {};
  const nodeHandles: getEdgesReturn['nodeHandles'] = {};

  for ( const edge of preparedEdges ) {
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

  const edges = preparedEdges.map(( edge ) => ({
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
  }))


  return {
    nodeHandles,
    edges
  }
}

