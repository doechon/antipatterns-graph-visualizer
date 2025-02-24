import { lastOf } from "@/utils/base";
import {Data, Reactflow, Workflow} from "./types";


export const convertData2Workflow = (data:Data ): Workflow => {
  const edgesCount: Record<string, number> = {};
  let preparedEdges:Workflow['edges'] = []
  for (const edge of data.edges) {
    if (!edgesCount[edge]) {
      edgesCount[edge] = 0
    } else {
      edgesCount[edge]++
    }
    const count = edgesCount[edge]
    preparedEdges.push({id: `${edge.source}#${edge.target}#${count}`, source: edge.source, target: edge.target, sourceHandle: `${edge.source}#source#${count}`, targetHandle: `${edge.target}#target#0`})
  }

  return {
    nodes: data.nodes.map(nodeName => ({id: nodeName, type: 'base'})),
    edges: preparedEdges
  }
}

export const workflow2reactflow = (workflow: Workflow): Reactflow => {
  const { nodes = [], edges = [] } = workflow ?? {};
  const edgesCount: Record<string, number> = {};
  const edgesIndex: Record<string, { source: number; target: number }> = {};
  const nodeHandles: Record<
    string,
    {
      sourceHandles: Record<string, number>;
      targetHandles: Record<string, number>;
    }
  > = {};

  for (const edge of edges) {
    const { source, target, sourceHandle, targetHandle } = edge;
    for (const i of [sourceHandle,targetHandle, `source-${source}`, `target-${target}`]) {
      if (!edgesCount[i]) {
        edgesCount[i] = 1;
      } else {
        edgesCount[i] += 1;
      }
    }

    edgesIndex[edge.id] = {
      source: edgesCount[sourceHandle] - 1,
      target: edgesCount[targetHandle] - 1,
    };

    if (!nodeHandles[source]) {
      nodeHandles[source] = { sourceHandles: {}, targetHandles: {} };
    }
    if (!nodeHandles[target]) {
      nodeHandles[target] = { sourceHandles: {}, targetHandles: {} };
    }

    if (!nodeHandles[source].sourceHandles[sourceHandle]) {
      nodeHandles[source].sourceHandles[sourceHandle] = 1;
    } else {
      nodeHandles[source].sourceHandles[sourceHandle] += 1;
    }

    if (!nodeHandles[target].targetHandles[targetHandle]) {
      nodeHandles[target].targetHandles[targetHandle] = 1;
    } else {
      nodeHandles[target].targetHandles[targetHandle] += 1;
    }
  }

  return {
    nodes: nodes.map((node) => ({
      ...node,
      data: {
        ...node,
        sourceHandles: Object.keys(nodeHandles[node.id]?.sourceHandles ?? []),
        targetHandles: Object.keys(nodeHandles[node.id]?.targetHandles ?? []),
      },
      position: { x: 0, y: 0 },
    })),
    edges: edges.map((edge) => ({
      ...edge,
      data: {
        sourcePort: {
          edges: edgesCount[`source-${edge.source}`],
          portIndex: parseInt(lastOf(edge.sourceHandle.split("#"))!, 10),
          portCount: Object.keys(nodeHandles[edge.source].sourceHandles).length,
          edgeIndex: edgesIndex[edge.id].source,
          edgeCount: edgesCount[edge.sourceHandle],
        },
        targetPort: {
          edges: edgesCount[`target-${edge.target}`],
          portIndex: parseInt(lastOf(edge.targetHandle.split("#"))!, 10),
          portCount: Object.keys(nodeHandles[edge.target].targetHandles).length,
          edgeIndex: edgesIndex[edge.id].target,
          edgeCount: edgesCount[edge.targetHandle],
        },
      },
    })),
  };
};
