import React, { forwardRef, HTMLAttributes, memo, ReactNode } from "react";
import { NodeProps, Panel, PanelPosition } from "@xyflow/react";
import { BaseNode } from "../BaseNode";
import { cn } from "@/lib/utils";

/* GROUP NODE Label ------------------------------------------------------- */

export type GroupNodeLabelProps = HTMLAttributes<HTMLDivElement>;

export const GroupNodeLabel = forwardRef<HTMLDivElement, GroupNodeLabelProps>(
  ( { children, className, ...props }, ref ) => {
    return (
      <div ref={ ref } className={ cn("h-full w-full", className) } { ...props }>
        <div
          className={ cn(
            "px-3 py-1.5 text-sm font-semibold text-gray-700",
            "shadow-sm ring-1 ring-gray-200/80",
            "transition-colors duration-200",
            "group-hover:ring-gray-300",
            className
          ) }
        >
          { children }
        </div>
      </div>
    );
  }
);

GroupNodeLabel.displayName = "GroupNodeLabel";

/* GROUP NODE -------------------------------------------------------------- */

export type GroupNodeProps = Partial<NodeProps> & {
  label?: ReactNode;
  position?: PanelPosition;
};

export const GroupNode = forwardRef<HTMLDivElement, GroupNodeProps>(
  ( { selected, label, position, data, ...props }, ref ) => {
    const getLabelPosition = ( position?: PanelPosition ) => {
      switch ( position ) {
        case "top-left":
          return "justify-start items-start";
        case "top-center":
          return "justify-center items-start";
        case "top-right":
          return "justify-end items-start";
        case "bottom-left":
          return "justify-start items-end";
        case "bottom-right":
          return "justify-end items-end";
        case "bottom-center":
          return "justify-center items-end";
        default:
          return "justify-start items-start";
      }
    };

    return (
      <BaseNode
        ref={ ref }
        selected={ selected }
        className={ cn(
          "h-full overflow-hidden rounded-lg bg-white/40",
          "transition-all duration-200 ease-in-out",
          "hover:ring-gray-300 hover:shadow-xl",
          selected && "ring-2 ring-blue-500/80 shadow-xl",
          "p-0"
        ) }
        data={ data }
        { ...props }
      >
        <Panel
          className={ cn(
            "w-full h-full p-2",
            getLabelPosition(position)
          ) }
          position={ position }
        >
          { label && (
            <GroupNodeLabel>
              { label }
            </GroupNodeLabel>
          ) }
        </Panel>
      </BaseNode>
    );
  }
);

GroupNode.displayName = "GroupNode";

/* DEMO COMPONENT ---------------------------------------------------------- */

export const LabeledGroupNodeDemo = memo(( { selected, ...props }: NodeProps ) => {
  return (
    <GroupNode
      selected={ selected }
      { ...props }
      label={
        <div className="flex items-center gap-2">
          <span className="text-blue-500">●</span>
          <span>Group Node</span>
        </div>
      }
    />
  );
});