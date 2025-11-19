import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls,
  Handle,
  Position 
} from 'reactflow';
import { hierarchy, tree } from 'd3-hierarchy';
import 'reactflow/dist/style.css';

// const mockData = {
//   "Personal Info": [{id:11,name:"John Doe"}, {id:12,email:"johndoe@example.com"}],
//   Education: [{id:21,clg:"B.Tech, IIT"}, {id:22,clg:"M.Tech, MIT"}],
//   Experience: [{id:31,vl:"DevOps Engineer at XYZ"},{id:34, vl:"Intern at ABC"}],
//   Projects: [{id:41,vl:"Project A"}, {id:42,vl:"Project B"}, {id:43,vl:"Project C"}, {id:44,vl:"Project D"}],
//   Skills: [{id:51,vi:"React"}, {id:52,vi:"Django"},{id:53, vi:"PostgreSQL"}],
//   Achievements: [{id: 61,vi:"Award A"}, {id:62,vi:"Achievement B"}],
//   Publications: [{id:71,vi:"Paper A"}, {id:72,vi:"Paper B"}],
//   Certifications: [{id:81,vi:"Cert A"}, {id:82,vi:"Cert B"}],
// };


const mockData = {
  "Personal Info": [{ name: "John Doe"}, {email: "johndoe@example.com" }],
  Education: ["B.Tech, IIT", "M.Tech, MIT"],
  Experience: ["DevOps Engineer at XYZ", "Intern at ABC"],
  Projects: ["Project A", "Project B"],
  Skills: ["React", "Django", "PostgreSQL"],
  Achievements: ["Award A", "Achievement B"],
  Publications: ["Paper A", "Paper B"],
  Certifications: ["Cert A", "Cert B"],
};

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const NODE_MARGIN = 100;

// Custom node component
const CustomNode = ({ data }) => (
  <div className="p-3 bg-white border-2 border-blue-500 rounded-lg shadow-lg">
    <Handle type="target" position={Position.Top} />
    <div className="text-sm font-medium text-blue-600 truncate">{data.label}</div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const nodeTypes = { custom: CustomNode };

const objtostr=(obj)=>{
  let str="";
  if(obj===undefined){
    return "";
  }
  if(typeof obj === "string"){
    return obj;
  }
  for(let key in obj){
    str+=key+":"+obj[key];
  }
  return str;
}

const getLayoutedElements = (nodes) => {
  const hierarchyData = {
    name: "root",
    children: Object.entries(mockData).map(([key, values]) => ({
      name: key,
      children: values.map((value,index) => {
        return { name: ""+objtostr(value)  }
      })
    }))
  };

  const root = hierarchy(hierarchyData);
  const treeLayout = tree()
    .nodeSize([NODE_WIDTH + NODE_MARGIN, NODE_HEIGHT + NODE_MARGIN]);

  treeLayout(root);

  const layoutedNodes = root.descendants().map((node, index) => ({
    id: node.data.name,
    position: { x: node.x, y: node.y },
    data: { label: node.data.name },
    type: 'custom'
  }));

  return layoutedNodes.filter(node => node.id !== "root");
};

export default function FlowchartJSONBuilder() {
  const [nodes, setNodes] = useState(() => getLayoutedElements(mockData));
  const [edges, setEdges] = useState([]);
  const [jsonOutput, setJsonOutput] = useState({});

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    updateJSON(params);
  }, []);

  const updateJSON = (newEdge) => {
    setJsonOutput(prev => {
      const sourceNode = nodes.find(n => n.id === newEdge.source);
      const targetNode = nodes.find(n => n.id === newEdge.target);
      
      // For category-to-item connections
      if (Object.keys(mockData).includes(sourceNode.id)) {
        return {
          ...prev,
          [sourceNode.id]: [
            ...(prev[sourceNode.id] || []),
            targetNode.data.label
          ]
        };
      }
      
      // For item-to-item connections
      return {
        ...prev,
        [sourceNode.data.label]: targetNode.data.label
      };
    });
  };
  useEffect(()=>{
    
  },[]);

  return (
    <div className="h-screen w-full">
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-2">Connection Rules:</h2>
        <ul className="list-disc pl-4 text-sm">
          <li>Drag from right handle (source) to left handle (target)</li>
          <li>Connect category nodestotheir items</li>
          <li>Multiple connections allowed</li>
        </ul>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        nodesDraggable={true}
      >
        <Background gap={30} />
        <Controls />
      </ReactFlow>

      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow max-w-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Generated JSON Structure:</h3>
          <button 
            onClick={() => navigator.clipboard.writeText(JSON.stringify(jsonOutput))}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          >
            Copy JSON
          </button>
        </div>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40 text-sm">
          {JSON.stringify(jsonOutput, null, 2)}
        </pre>
      </div>
    </div>
  );
}