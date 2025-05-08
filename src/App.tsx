import "@xyflow/react/dist/style.css";

import { useEffect, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

import { jsonDecode } from "@/utils/base";

import { ControlPanel } from "./components/ControlPanel";
import { kEdgeTypes } from "./components/Edges";
import { ColorfulMarkerDefinitions } from "./components/Edges/Marker";
import { kNodeTypes } from "./components/Nodes";
import { ReactflowInstance } from "./components/ReactflowInstance";
import defaultWorkflow from "../data.json";
import { convertData2Workflow, workflow2reactflow } from "./data-convert";
import { kDefaultLayoutConfig, ReactflowLayoutConfig } from "./layout/node";
import { useAutoLayout } from "./layout/useAutoLayout";
import { Summary, SummaryProps } from "@/components/Legend";

const EditWorkFlow = () => {
  const [ nodes, setNodes, onNodesChange ] = useNodesState([]);
  const [ edges, _setEdges, onEdgesChange ] = useEdgesState([]);
  const [ toggleNames, setToggleNames ] = useNodesState([]);
  const [ summary, setSummary ] = useState<SummaryProps | undefined>();


  const { layout, layouting } = useAutoLayout();

  const layoutReactflow = async (
    props:
      ReactflowLayoutConfig & {
      workflow: string;
    }
  ) => {
    if ( layouting ) {
      return;
    }
    const { workflow, ...config } = props;
    const data = jsonDecode(workflow);
    if ( !data ) {
      alert("Invalid workflow JSON data");
      return;
    }

    const reactflow = workflow2reactflow({ workflow: data, config });
    await layout({ ...reactflow, ...props });
  };

  useEffect(() => {
    const {
      nodes,
      edges,
      toggleNames,
      summary
    } = workflow2reactflow({
      workflow: convertData2Workflow(defaultWorkflow as any),
      config: kDefaultLayoutConfig
    });
    setToggleNames(toggleNames)
    setSummary(summary)
    layout({ nodes, edges, ...kDefaultLayoutConfig, toggleNames });
  }, []);

  if ( toggleNames.length === 0 ) {
    return null;
  }

  return (
    <div
      style={ {
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      } }
    >
      <Summary { ...summary }/>
      <ColorfulMarkerDefinitions/>
      <ReactFlow
        nodes={ nodes }
        edges={ edges }
        nodeTypes={ kNodeTypes }
        edgeTypes={ kEdgeTypes }
        onNodesChange={ onNodesChange }
        onEdgesChange={ onEdgesChange }
      >
        <Background id="0" color="#ccc" variant={ BackgroundVariant.Dots }/>
        <ReactflowInstance/>
        <Controls/>
        <MiniMap
          pannable
          zoomable
          maskColor="transparent"
          maskStrokeColor="black"
          maskStrokeWidth={ 10 }
        />
        <ControlPanel layoutReactflow={ layoutReactflow } toggleNames={ toggleNames }/>)
      </ReactFlow>
    </div>
  );
};

export const WorkFlow = () => {
  return (
    <ReactFlowProvider>
      <EditWorkFlow/>
    </ReactFlowProvider>
  );
};
