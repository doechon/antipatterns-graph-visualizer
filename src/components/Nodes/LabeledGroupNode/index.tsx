import { memo } from "react";

import { NodeProps } from "@xyflow/react";
import { GroupNode } from "@/components/labeled-group-node.tsx";

export const LabeledGroupNodeDemo = memo(( { selected, ...props }: NodeProps ) => {
  return <GroupNode selected={ selected } { ...props } label="Label"/>;
});

