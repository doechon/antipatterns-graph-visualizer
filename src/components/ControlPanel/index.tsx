import { button, Leva, useControls } from "leva";
import defaultWorkflow from "../../../data.json";
import { kDefaultLayoutConfig, ReactflowLayoutConfig } from "../../layout/node";
import { jsonEncode } from "@/utils/base";
import { AntiPatternType, convertData2Workflow } from "@/data-convert";
import { useMemo } from "react";
import { Reactflow } from "@/data-convert/types.ts";
import { whiteTheme } from "./style.ts";

export const kReactflowLayoutConfig: {
  setState: any;
  state: ReactflowLayoutConfig;
} = {} as any;

export const workflowInputHint = jsonEncode(convertData2Workflow(defaultWorkflow as any))!;

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

const directions = Object.entries({
  vertical: "vertical",
  horizontal: "horizontal",
}).reduce(
  ( pre, [ key, value ] ) => {
    pre[key] = value;
    return pre;
  },
  {
    [kDefaultLayoutConfig.direction]: kDefaultLayoutConfig.direction,
  } as any
);

const reverseSourceHandlesKeyMap: Record<string, string> = {
  false: "asc",
  true: "desc",
};
const reverseSourceHandles = Object.entries({
  asc: false,
  desc: true,
}).reduce(
  ( pre, [ key, value ] ) => {
    pre[key] = value;
    return pre;
  },
  {
    [reverseSourceHandlesKeyMap[
      kDefaultLayoutConfig.reverseSourceHandles.toString()
      ]]: kDefaultLayoutConfig.reverseSourceHandles,
  } as any
);


export const ControlPanel = ( props: {
  layoutReactflow: any,
  antiPatternToggles?: Reactflow['antiPatternToggles']
} ) => {
  const { layoutReactflow, antiPatternToggles } = props;


  const toggleControls = useMemo(() => antiPatternToggles?.reduce(( prev, { name, type }, ind ) => ({
      ...prev,
      [name]: {
        order: ind + 1,
        label: name,
        value: false,
        disabled: type === AntiPatternType.NOT_FOUND
      }
    }), {}), [ antiPatternToggles ]
  )

  const [ state, setState ] = useControls(() => {
    return {
      ...toggleControls,
      algorithm: {
        order: 0,
        label: "Algorithms",
        options: algorithms,
      },
      layout: {
        order: Object.keys(toggleControls).length + 2,
        label: "Layout",
        ...button(( get ) => {
          layoutReactflow({
            workflow: workflowInputHint,
            algorithm: get("algorithm"),
            direction: get("direction"),
            spacing: get("spacing"),
            reverseSourceHandles: false,
            toggles: Object.keys(toggleControls).map(toggleName => ({ [toggleName]: get(toggleName) })),
          });
        }),
      },
    };
  });

  kReactflowLayoutConfig.state = state as any;
  kReactflowLayoutConfig.setState = setState;

  return <Leva theme={ whiteTheme } hideCopyButton titleBar={ { title: "AntiPatterns" } }/>;
};
