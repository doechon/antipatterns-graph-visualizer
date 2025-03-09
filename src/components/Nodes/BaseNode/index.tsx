import "./styles.css";

import { ComponentType, memo, useState } from "react";
import { Handle, NodeProps, NodeToolbar, Position } from "@xyflow/react";

import { ReactflowNodeData } from "@/data/types";
import { kReactflowLayoutConfig } from "@/components/ControlPanel";
import { cn } from "@/lib/utils.ts";

export const BaseNode: ComponentType<NodeProps<ReactflowNodeData> & { className?: string }> = memo(
  ( { className, data } ) => {
    const { direction, reverseSourceHandles } = kReactflowLayoutConfig.state;
    const isHorizontal = direction === "horizontal";
    const targetHandlesFlexDirection: any = isHorizontal ? "column" : "row";
    const sourceHandlesFlexDirection: any =
      targetHandlesFlexDirection + (reverseSourceHandles ? "-reverse" : "");

    const [ isTooltipVisible, setTooltipVisible ] = useState(false);

    const handleFocus = () => setTooltipVisible(true);

    const handleBlur = () => setTooltipVisible(false);

    const hslVal = 0.6 * data?.bottleneckPercent
    const hsl = `hsl(0, ${ hslVal * 100 }%, ${ (1 - hslVal) * 100 }%)`

    return (
      <div
        className={ cn(
          "relative rounded-md border bg-card p-5 text-card-foreground",
          "hover:ring-1",
          className
        ) }
        onMouseEnter={ () => setTooltipVisible(true) }
        onMouseLeave={ () => setTooltipVisible(false) }
        onFocus={ handleFocus }
        onBlur={ handleBlur }
        style={ data?.bottleneckPercent !== void 0 ? { background: `${ hsl }` } : {} }
      >

        <NodeToolbar
          isVisible={ isTooltipVisible }
          className="rounded-sm bg-primary p-2 text-primary-foreground"
          position={ Position.Top }
          tabIndex={ 1 }
        >
          { data?.tooltip?.label }
        </NodeToolbar>
        <div
          className={ `handles handles-${ direction } targets` }
          style={ {
            flexDirection: targetHandlesFlexDirection,
          } }
        >
          { data?.targetHandles.map(( id ) => (
            <Handle
              className={ `handle handle-${ direction }` }
              key={ id }
              id={ id }
              type="target"
              position={ isHorizontal ? Position.Left : Position.Top }
            />
          )) }
        </div>
        <div className="label">{ data?.id }</div>
        <div
          className={ `handles handles-${ direction } sources` }
          style={ {
            flexDirection: sourceHandlesFlexDirection,
          } }
        >
          { data?.sourceHandles.map(( id ) => (
            <Handle
              className={ `handle handle-${ direction }` }
              key={ id }
              id={ id }
              type="source"
              position={ isHorizontal ? Position.Right : Position.Bottom }
            />
          )) }
        </div>
      </div>
    );
  }
);

BaseNode.displayName = "BaseNode";
