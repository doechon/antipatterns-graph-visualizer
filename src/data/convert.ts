import { lastOf } from "@/utils/base";
import { Data, Reactflow, ReactflowNodeWithData, Workflow } from "./types";

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

export const workflow2reactflow = ( workflow: Workflow ): Reactflow => {
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
    nodes: nodes.reduce(( acc, node ) => {
      const stats = {
        bottleneckPercent: workflow.showStats?.bottleneck && analysis.bottlenecks && node.id in analysis.bottlenecks ? analysis.bottlenecks[node.id] : void 0,
        godClassesPercent: workflow.showStats?.godClasses && analysis.godClasses && node.id in analysis.godClasses ? analysis.godClasses[node.id] : void 0,
      }
      const label = Object.entries(stats).reduce(( acc, curVal ) => curVal[1] ? acc += `${ curVal[0] }: ${ curVal[1] }%\n` : '', '')

      let parentId = void 0
      if ( node.id in analysis.bottlenecks ) {
        parentId = 'bottleneck'
      } else if ( node.id in analysis.godClasses ) {
        parentId = 'godClasses'
      }
      console.log(node)
      console.log('Object.values(stats)', Object.values(stats))
      console.log('Object.values(stats).every(x => x === void 0)', Object.values(stats).every(x => x === void 0))
      console.log('workflow.showStats !== void 0', workflow.showStats !== void 0)
      console.log('workflow.showStats !== void 0 && Object.keys(workflow.showStats).length > 0', workflow.showStats !== void 0 && Object.keys(workflow.showStats).length > 0)
      console.log('workflow.showStats !== void 0 && Object.keys(workflow.showStats).length > 0 && Object.values(stats).every(x => x === void 0)',
        workflow.showStats !== void 0 && Object.keys(workflow.showStats).length > 0 && Object.values(stats).every(x => x === void 0))
      console.log('------------')
      if ( workflow.showStats !== void 0 && Object.keys(workflow.showStats).length > 0 && !(Object.keys(workflow.showStats).includes(node.id)) && Object.values(stats).every(x => x === void 0) ) {
        console.log('1')
        console.log('acc', acc)
        return acc
      }
      acc.push({
        ...node,
        data: {
          ...node,
          sourceHandles: Object.keys(nodeHandles[node.id]?.sourceHandles ?? []),
          targetHandles: Object.keys(nodeHandles[node.id]?.targetHandles ?? []),
          ...stats,
          tooltip: { label: label ? label : void 0 },
        },
        position: { x: 0, y: 0 },
        parentId,
        type: node.type,
        extent: node.id in analysis.bottlenecks || node.id in analysis.godClasses ? 'parent' : void 0,
      })
      return acc
    }, [] as ReactflowNodeWithData[]) ?? [],
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
