import { NodeTypes } from 'reactflow';
import { BaseNode } from './BaseNode';
import { LabeledGroupNodeDemo } from "@/components/Nodes/LabeledGroupNode";

export const kNodeTypes: NodeTypes = {
  base: BaseNode,
  group: LabeledGroupNodeDemo
};
