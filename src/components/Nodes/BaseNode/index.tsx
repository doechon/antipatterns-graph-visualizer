import "./styles.css";

import { ComponentType, memo, useState } from "react";
import { Handle, NodeProps, NodeResizeControl, NodeToolbar, Position } from "@xyflow/react";

import { ReactflowNodeData } from "@/data-convert/types.ts";
import { kReactflowLayoutConfig } from "@/components/ControlPanel";
import { cn } from "@/lib/utils.ts";
import { getShortNodeName } from "@/data-convert/get-short-node-name.ts";

export const BaseNode: ComponentType<NodeProps<ReactflowNodeData> & { className?: string }> = memo(
  ( { className, data } ) => {
    const { direction, reverseSourceHandles } = kReactflowLayoutConfig.state;
    const isHorizontal = direction === "horizontal";
    const targetHandlesFlexDirection: any = isHorizontal ? "column" : "row";
    const sourceHandlesFlexDirection: any =
      targetHandlesFlexDirection + (reverseSourceHandles ? "-reverse" : "");

    const [ nodeId, setNodeId ] = useState(getShortNodeName(data.id))

    const [ isTooltipVisible, setTooltipVisible ] = useState(false);

    const handleFocus = () => setTooltipVisible(true);

    const handleBlur = () => setTooltipVisible(false);

    const hslVal = 0.6 * data?.nodeMetricPercent
    const hsl = `hsl(0, ${ hslVal * 100 }%, ${ (1 - hslVal) * 100 }%)`

    return (
      <div
        ref={ ( ref ) => {
          if ( ref ) {
            ref.parentElement!.style.width = `${ data?.width }px`
            ref.parentElement!.style.height = `${ data?.height }px`
          }
        } }
        className={ cn(
          "relative rounded-md border bg-card p-5 text-card-foreground",
          "hover:ring-1",
          className
        ) }
        onMouseEnter={ () => {
          setTooltipVisible(true)
          // setNodeId(data?.id)
        } }
        onMouseLeave={ () => {
          setTooltipVisible(false)
          // setNodeId(getShortNodeName(data.id))
        } }
        onFocus={ handleFocus }
        onBlur={ handleBlur }
        style={ data?.nodeMetricPercent !== void 0 ? { background: `${ hsl }` } : {} }
      >
        <NodeResizeControl minWidth={ 100 } minHeight={ 50 }>
          <ResizeIcon/>
        </NodeResizeControl>
        {
          data?.tooltip?.label && (
            <NodeToolbar
              isVisible={ isTooltipVisible }
              className="rounded-sm bg-primary p-2 text-primary-foreground"
              position={ Position.Top }
              tabIndex={ 1 }
            >
              { data?.tooltip?.label }
            </NodeToolbar>
          )
        }
        <div
          className={ `handles handles-${ direction } targets` }
          // style={ {
          //   flexDirection: targetHandlesFlexDirection,
          // } }
        >
          { data?.targetHandles.map(( id ) => (
            <Handle
              className={ `handle handle-${ direction }` }
              key={ id }
              id={ id }
              type="target"
              position={ Position.Top }
              // position={ isHorizontal ? Position.Left : Position.Top }
            />
          )) }
        </div>
        <div className="label">
          <div>{ nodeId }</div>
          <div>{ data?.tooltip?.label }</div>
        </div>
        <div
          className={ `handles handles-${ direction } sources` }
          // style={ {
          //   flexDirection: sourceHandlesFlexDirection,
          // } }
        >
          { data?.sourceHandles.map(( id ) => (
            <Handle
              className={ `handle handle-${ direction }` }
              key={ id }
              id={ id }
              type="source"
              position={ Position.Bottom }
              // position={ isHorizontal ? Position.Right : Position.Bottom }
            />
          )) }
        </div>
      </div>
    );
  }
);

function ResizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="#ff0071"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={ { position: 'absolute', right: 5, bottom: 5 } }
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <polyline points="16 20 20 20 20 16"/>
      <line x1="14" y1="14" x2="20" y2="20"/>
      <polyline points="8 4 4 4 4 8"/>
      <line x1="4" y1="4" x2="10" y2="10"/>
    </svg>
  );
}


BaseNode.displayName = "BaseNode";
