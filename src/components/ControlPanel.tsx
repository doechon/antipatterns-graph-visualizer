import { button, Leva, useControls } from "leva";
import defaultWorkflow from "../../data-short.json";
import { kDefaultLayoutConfig, ReactflowLayoutConfig } from "../layout/node";
import { jsonEncode } from "@/utils/base";
import { convertData2Workflow } from "@/data-convert";
import { useMemo } from "react";

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


export const ControlPanel = ( props: { layoutReactflow: any, toggleNames?: string[] } ) => {
  const { layoutReactflow, toggleNames } = props;

  const toggleControls = useMemo(() => toggleNames?.reduce(( prev, cur, ind ) => ({
      ...prev,
      [cur]: {
        order: 5 + ind,
        label: cur,
        value: false
      }
    }), {}), [ toggleNames ]
  )

  const [ state, setState ] = useControls(() => {
    return {
      algorithm: {
        order: 1,
        label: "Algorithms",
        options: algorithms,
      },
      direction: {
        order: 2,
        label: "Direction",
        options: directions,
      },
      spacing: {
        order: 3,
        label: "Spacing",
        value: kDefaultLayoutConfig.spacing as any,
        joystick: false,
      },
      reverseSourceHandles: {
        order: 4,
        label: "Order",
        options: reverseSourceHandles,
      },
      ...toggleControls,
      layout: {
        order: 4 + Object.keys(toggleControls).length + 1,
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

  return <Leva hideCopyButton titleBar={ { filter: false } }/>;
};
