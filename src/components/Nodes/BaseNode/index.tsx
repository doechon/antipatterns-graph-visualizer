import "./styles.css";

import React, { ComponentType, memo, useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";

import { ReactflowNodeData } from "@/data-convert/types.ts";
import { cn } from "@/lib/utils.ts";
import { getShortNodeName } from "@/data-convert/get-short-node-name.ts";
import { Crosshair, EqualIcon, Table2 } from "lucide-react";

export const BaseNode: ComponentType<NodeProps<ReactflowNodeData> & { className?: string, type?: string }> = memo(
  ( { className, type, data, selected }: NodeProps<ReactflowNodeData> & { className?: string } ) => {
    const { direction, reverseSourceHandles } = { direction: "vertical", reverseSourceHandles: false };
    const isHorizontal = direction === "horizontal";
    const targetHandlesFlexDirection: any = isHorizontal ? "column" : "row";
    const sourceHandlesFlexDirection: any =
      targetHandlesFlexDirection + (reverseSourceHandles ? "-reverse" : "");

    const [ nodeId, setNodeId ] = useState(getShortNodeName(data.id))

    const [ isTooltipVisible, setTooltipVisible ] = useState(false);

    const handleFocus = () => setTooltipVisible(true);

    const handleBlur = () => setTooltipVisible(false);

    const hslVal = data?.nodeMetricPercent * 0.5
    const hsl = `hsl(0, ${ hslVal }%, ${ (1 - hslVal / 100) * 100 }%)`

    return (
      <div
        ref={ ( ref ) => {
          if ( ref ) {
            ref.parentElement!.style.width = `${ data?.width }px`
            ref.parentElement!.style.height = `${ data?.height }px`
          }
        } }
        className={ cn(
          "min-w-[180px] overflow-hidden rounded-lg border border-border bg-background/80 shadow-md",
          "hover:ring-2 hover:ring-primary hover:shadow-lg",
          selected && "ring-2 ring-primary shadow-lg",
          hslVal > 30 && "text-[#CCCCCC]",
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
        <div className="border-b border-border bg-muted/30 p-2">
          <header className="flex items-center gap-2 text-sm font-medium">
            <Table2 size={ 14 }/>
            <span className="truncate">{ nodeId }</span>
            <div className="ml-auto h-2 w-2 rounded-full bg-green-400/80 shadow-inner"/>
          </header>
        </div>

        {/* Stats Section */ }
        <div className="divide-y divide-border/50">
          { data?.stats?.map(( { antiPatternName, value } ) => (
            <div
              key={ antiPatternName }
              className={ cn(
                "flex items-center gap-3 px-3 py-2 text-sm",
                antiPatternName === 'Total' ? "font-semibold" : "font-medium"
              ) }
            >
              <div>
                { antiPatternName === 'Total' ? (
                  <EqualIcon size={ 12 } strokeWidth={ 2 }/>
                ) : (
                  <Crosshair size={ 12 } strokeWidth={ 1.5 }/>
                ) }
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="truncate">{ antiPatternName }</span>
                <span className="font-mono text-xs">
                  { value }%
                </span>
              </div>
            </div>
          )) }
        </div>

        <div
          className={ cn(`handles handles-${ direction } targets`,
            nodeId === "Pet" && "handles-targets-reverse"
          ) }
        >
          { data?.targetHandles?.map(( id ) => (
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
        <div
          className={ cn(`handles handles-${ direction } sources`,
            nodeId === "Pet" && "handles-sources-reverse"
          ) }
        >
          { data?.sourceHandles?.map(( id ) => (
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


BaseNode.displayName = "BaseNode";
