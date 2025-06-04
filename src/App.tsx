import "@xyflow/react/dist/style.css";

import { useEffect, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
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

import { convertData2Workflow, workflow2reactflow } from "./data-convert";
import { kDefaultLayoutConfig, ReactflowLayoutConfig } from "./layout/node";
import { useAutoLayout } from "./layout/useAutoLayout";
import { Reactflow } from "@/data-convert/types.ts";

const EditWorkFlow = () => {
  const [ nodes, setNodes, onNodesChange ] = useNodesState([]);
  const [ edges, _setEdges, onEdgesChange ] = useEdgesState([]);
  const [ antiPatternToggles, setAntiPatternToggles ] = useState<Reactflow['antiPatternToggles'] | undefined>();
  const [ workflowState, setWorkflow ] = useState();


  const { layout, layouting } = useAutoLayout();

  const layoutReactflow = async (
    props: ReactflowLayoutConfig & { workflow?: string }
  ) => {
    if ( layouting ) return;

    const { workflow, ...config } = props;
    const data = jsonDecode(workflow) ?? workflowState;
    if ( !data ) {
      alert("Invalid workflow JSON data");
      return;
    }

    const reactflow = workflow2reactflow({ workflow: data, config });
    await layout({ ...reactflow, ...props });
  };

  useEffect(() => {
    const loadWorkflow = async () => {
      const jsonPath = "data.json";
      try {
        const res = await fetch(jsonPath);
        const raw = await res.json();
        const workflow = convertData2Workflow(raw);
        const {
          nodes,
          edges,
          antiPatternToggles
        } = workflow2reactflow({
          workflow,
          config: kDefaultLayoutConfig
        });
        setWorkflow(() => workflow)
        setAntiPatternToggles(() => antiPatternToggles);
        layout({ nodes, edges, ...kDefaultLayoutConfig, antiPatternToggles });
      } catch ( err ) {
        console.error("Ошибка загрузки JSON-файла:", err);
        alert("Ошибка загрузки JSON. Проверь путь и наличие файла.");
      }
    };

    loadWorkflow();
  }, []);

  if ( !antiPatternToggles || antiPatternToggles.length === 0 ) {
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
        <ControlPanel layoutReactflow={ layoutReactflow } antiPatternToggles={ antiPatternToggles }/>
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
