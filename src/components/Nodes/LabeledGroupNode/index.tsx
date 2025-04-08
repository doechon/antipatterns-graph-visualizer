import React, { forwardRef, HTMLAttributes, memo, ReactNode } from "react";

import { NodeProps, Panel, PanelPosition } from "@xyflow/react";
import './styles.css'
import { BaseNode } from "../BaseNode";
import { cn } from "@/lib/utils";

/* GROUP NODE Label ------------------------------------------------------- */

export type GroupNodeLabelProps = HTMLAttributes<HTMLDivElement>;

export const GroupNodeLabel = forwardRef<HTMLDivElement, GroupNodeLabelProps>(
  ( { children, className, ...props }, ref ) => {
    return (
      <div ref={ ref } className={ cn("h-full w-full") } { ...props }>
        <div
          className={ cn(
            "w-fit bg-gray-200 bg-secondary p-2 text-xs text-card-foreground",
            className,
          ) }
        >
          { children }
        </div>
      </div>
    );
  },
);

GroupNodeLabel.displayName = "GroupNodeLabel";

export type GroupNodeProps = Partial<NodeProps> & {
  label?: ReactNode;
  position?: PanelPosition;
};

/* GROUP NODE -------------------------------------------------------------- */

export const GroupNode = forwardRef<HTMLDivElement, GroupNodeProps>(
  ( { selected, label, position, data, ...props }, ref ) => {
    const getLabelClassName = ( position?: PanelPosition ) => {
      switch ( position ) {
        case "top-left":
          return "rounded-br-sm";
        case "top-center":
          return "rounded-b-sm";
        case "top-right":
          return "rounded-bl-sm";
        case "bottom-left":
          return "rounded-tr-sm";
        case "bottom-right":
          return "rounded-tl-sm";
        case "bottom-center":
          return "rounded-t-sm";
        default:
          return "rounded-br-sm";
      }
    };


    return (
      <BaseNode
        ref={ ref }
        selected={ selected }
        className={ cn("h-full overflow-hidden rounded-sm bg-white bg-opacity-50 p-0",
        ) }
        data={ data }
        { ...props }
      >

        {/*<NodeResizeControl minWidth={ 100 } minHeight={ 50 }>*/ }
        {/*  <ResizeIcon/>*/ }
        {/*</NodeResizeControl>*/ }
        <Panel className={ cn("m-0 p-0") } position={ position }>
          { label && (
            <GroupNodeLabel className={ getLabelClassName(position) }>
              { label }
            </GroupNodeLabel>
          ) }
        </Panel>
      </BaseNode>
    );
  },
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

GroupNode.displayName = "GroupNode";


export const LabeledGroupNodeDemo = memo(( { selected, ...props }: NodeProps ) => {
  return <GroupNode selected={ selected } { ...props } label="Label"/>;
});

