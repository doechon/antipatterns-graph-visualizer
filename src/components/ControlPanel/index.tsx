import { button, Leva, useControls } from "leva";
import { kDefaultLayoutConfig, ReactflowLayoutConfig } from "../../layout/node";
import { useMemo } from "react";
import { Reactflow } from "@/data-convert/types.ts";
import { whiteTheme } from "./style.ts";

export const kReactflowLayoutConfig: {
  setState: any;
  state: ReactflowLayoutConfig;
} = {} as any;

const algorithms = [
  "elk-mr-tree",
  "d3-hierarchy",
  "d3-dag",
  "ds-dag(s)",
  "elk-layered",
  "dagre-tree",
].reduce(
  ( pre, algorithm ) => {
    pre[algorithm] = algorithm;
    return pre;
  },
  {
    [kDefaultLayoutConfig.algorithm]: kDefaultLayoutConfig.algorithm,
  } as any
);

export const ControlPanel = ( props: {
  layoutReactflow: any;
  antiPatternToggles?: Reactflow["antiPatternToggles"];
} ) => {
  const { layoutReactflow, antiPatternToggles } = props;

  const toggleControls = useMemo(
    () =>
      antiPatternToggles?.reduce(( prev, { name, disabled }, ind ) => {
        prev[name] = {
          order: ind + 1,
          label: name,
          value: false,
          disabled,
        };
        return prev;
      }, {} as Record<string, any>),
    [ antiPatternToggles ]
  );

  const [ state, setState ] = useControls(() => {

    return {
      ...toggleControls,
      algorithm: {
        order: 0,
        label: "Algorithms",
        options: algorithms,
      },
      layout: {
        order: Object.keys(toggleControls || {}).length + 2,
        label: "Layout",
        ...button(( get ) => {
          layoutReactflow({
            algorithm: get("algorithm"),
            direction: get("direction"),
            spacing: get("spacing"),
            reverseSourceHandles: false,
            toggles: Object.keys(toggleControls || {}).map(( toggleName ) => ({
              [toggleName]: get(toggleName),
            })),
          });
        }),
      },
    };
  });

  kReactflowLayoutConfig.state = state as any;
  kReactflowLayoutConfig.setState = setState;

  return (
    <Leva
      theme={ whiteTheme }
      hideCopyButton
      titleBar={ { title: "AntiPatterns" } }
    />
  );
};
