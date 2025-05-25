import "./styles.css";

import React, { ComponentType, memo, useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";

import { ReactflowNodeData } from "@/data-convert/types.ts";
import { cn } from "@/lib/utils.ts";
import { getShortNodeName } from "@/data-convert/get-short-node-name.ts";
import { Crosshair, EqualIcon, Table2 } from "lucide-react";

export const BaseNode: ComponentType<NodeProps<ReactflowNodeData> & { className?: string, type?: string }> = memo(
  ( { className, type, data }: NodeProps<ReactflowNodeData> & { className?: string } ) => {
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
          "border-[0.5px] overflow-hidden rounded-[4px] shadow-sm",
          "relative rounded-md border bg-card p-5 text-card-foreground",
          "hover:ring-1 bg-alternative",
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
        <div
          className="border-[0.5px] overflow-hidden rounded-[4px] shadow-sm"
        >
          <header
            className={ cn(
              'text-[1rem] pl-2 pr-1 bg-alternative text-default flex items-center justify-between',
            ) }
          >
            <div className="flex gap-x-1 items-center">
              <Table2 strokeWidth={ 1 } size={ 12 } className="text-light"/>
              { nodeId }
            </div>
          </header>
        </div>

        { data?.stats?.map(( { antiPatternName, value } ) => (
          <div
            className={ cn(
              'text-[8px] leading-5 relative flex flex-row justify-items-start',
              'bg-surface-100',
              'border-t',
              'border-t-[0.5px]',
              'hover:bg-scale-500 transition cursor-default',
            ) }
            key={ antiPatternName }
          >
            <div
              className={ cn(
                'gap-[1rem] flex mx-2 align-middle items-center justify-start',
              ) }
            >
              {
                antiPatternName === 'Total' ? (
                  <EqualIcon
                    size={ 8 }
                    strokeWidth={ 1 }
                    fill="currentColor"
                    className="flex-shrink-0 text-light"
                  />
                ) : (
                  <Crosshair
                    size={ 12 }
                    strokeWidth={ 1 }
                    fill="currentColor"
                    className="flex-shrink-0 text-light"
                  />
                )
              }
            </div>
            <div className="flex w-full justify-between font-mono">
                <span className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[85px] text-[0.8rem]">
                  { antiPatternName }
                </span>
              <span className="px-2 inline-flex justify-end text-lighter text-[0.8rem]">
                  { `${ value }\%` }
                </span>
            </div>
          </div>
        )) }
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
