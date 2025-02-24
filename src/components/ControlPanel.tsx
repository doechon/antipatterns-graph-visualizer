import { button, Leva, useControls } from "leva";
import defaultWorkflow from "../data/data.json";
import { kDefaultLayoutConfig, ReactflowLayoutConfig } from "../layout/node";
import { jsonEncode } from "@/utils/base";
import { convertData2Workflow } from "@/data/convert.ts";

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

const BottleneckStatistics = Object.entries({
  true: true,
  false: false
}).reduce(
  ( pre, [ key, value ] ) => {
    pre[key] = value;
    return pre;
  },
  {
    [kDefaultLayoutConfig.bottleneckStatistics]: kDefaultLayoutConfig.bottleneckStatistics,
  } as any
)

export const ControlPanel = ( props: { layoutReactflow: any } ) => {
  const { layoutReactflow } = props;

  const [ state, setState ] = useControls(() => {
    return {
      workflow: {
        order: 1,
        label: "Workflow",
        rows: 3,
        value: workflowInputHint,
      },
      algorithm: {
        order: 2,
        label: "Algorithms",
        options: algorithms,
      },
      direction: {
        order: 3,
        label: "Direction",
        options: directions,
      },
      spacing: {
        order: 4,
        label: "Spacing",
        value: kDefaultLayoutConfig.spacing as any,
        joystick: false,
      },
      reverseSourceHandles: {
        order: 5,
        label: "Order",
        options: reverseSourceHandles,
      },
      bottleneckStatistics: {
        order: 6,
        label: 'BottleNeck Statistics',
        options: BottleneckStatistics
      },
      layout: {
        order: 7,
        label: "Layout",
        ...button(( get ) => {
          layoutReactflow({
            workflow: get("workflow"),
            algorithm: get("algorithm"),
            direction: get("direction"),
            spacing: get("spacing"),
            reverseSourceHandles: get("reverseSourceHandles"),
            bottleneckStatistics: get("bottleneckStatistics")
          });
        }),
      },
    };
  });

  kReactflowLayoutConfig.state = state as any;
  kReactflowLayoutConfig.setState = setState;

  return <Leva hideCopyButton titleBar={ { filter: false } }/>;
};
