import { Edge, Node, NodeToolbarProps, XYPosition } from "@xyflow/react";

import { ControlPoint } from "../layout/edge/point.ts";


interface Analysis {
  [key: string]: string[][] | { [key: string]: string[] } | { [key: string]: number };
}

export interface Data {
  architectureAnalysis: Analysis,
  dependencyGraph: {
    nodes: { id: string, type: string }[];
    edges: {
      source: string;
      type: string;
      target: string;
    }[]
  }
}

interface WorkflowNode {
  id: string;
  type: string;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface Workflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  analysis: Analysis;
}

export type ReactflowNode<
  D = any,
  T extends string | undefined = string | undefined
> = Node<D, T>;
export type ReactflowEdge<D = any> = Edge<D>;

export type ReactflowNodeData = WorkflowNode & {
  /**
   * The output ports of the current node.
   *
   * Format of Port ID: `nodeID#source#idx`
   */
  sourceHandles: string[];
  /**
   * The input port of the current node (only one).
   *
   * Format of Port ID: `nodeID#target#idx`
   */
  targetHandles: string[];
  tooltip?: {
    label: string;
    position?: NodeToolbarProps["position"];
  };
  /**
   * Bottleneck percent
   */
  bottleneckPercent?: number
};

export interface ReactflowEdgePort {
  /**
   * Total number of edges in this direction (source or target).
   */
  edges: number;
  /**
   * Number of ports
   */
  portCount: number;
  /**
   * Port's index.
   */
  portIndex: number;
  /**
   * Total number of Edges under the current port.
   */
  edgeCount: number;
  /**
   * Index of the Edge under the current port.
   */
  edgeIndex: number;
}

export interface EdgeLayout {
  /**
   * SVG path for edge rendering
   */
  path: string;
  /**
   * Control points on the edge.
   */
  points: ControlPoint[];
  labelPosition: XYPosition;
  /**
   * Current layout dependent variables (re-layout when changed).
   */
  deps?: any;
  /**
   * Potential control points on the edge, for debugging purposes only.
   */
  inputPoints: ControlPoint[];
}

export interface ReactflowEdgeData {
  /**
   * Data related to the current edge's layout, such as control points.
   */
  layout?: EdgeLayout;
  sourcePort: ReactflowEdgePort;
  targetPort: ReactflowEdgePort;
}

export type ReactflowNodeWithData = ReactflowNode<ReactflowNodeData>;
export type ReactflowEdgeWithData = ReactflowEdge<ReactflowEdgeData>;

export interface Reactflow {
  nodes: ReactflowNodeWithData[];
  edges: ReactflowEdgeWithData[];
  toggleNames: string[]
}
