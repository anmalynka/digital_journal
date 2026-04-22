import React, { useEffect, useState, useRef } from 'react';
import { useJournal } from '../context/JournalContext';
import { Share2, Zap } from 'lucide-react';
import * as db from '../lib/db';

const GraphView: React.FC = () => {
  const { navigatetoLink } = useJournal();
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    async function loadGraph() {
      const allBullets = await db.getAllBullets();
      const allCollections = await db.getCollections();
      
      const nodeMap = new Map();
      const linksData: any[] = [];

      // Add collection nodes
      allCollections.forEach(c => {
        nodeMap.set(c.title.toLowerCase(), { id: c.id, title: c.title, type: 'collection' });
      });

      // Parse bullets for links and dates
      allBullets.forEach(b => {
        if (!nodeMap.has(b.logId)) {
          nodeMap.set(b.logId, { id: b.logId, title: b.logId, type: 'date' });
        }
        
        if (b.links) {
          b.links.forEach(linkTitle => {
            linksData.push({ source: b.logId, targetTitle: linkTitle.toLowerCase() });
          });
        }
      });

      const nodesData = Array.from(nodeMap.values()).map((n) => ({
        ...n,
        x: Math.random() * 800 + 100,
        y: Math.random() * 500 + 100,
      }));

      // Resolve link targets to node IDs
      const resolvedLinks = linksData.map(l => {
        const targetNode = nodesData.find(n => n.title.toLowerCase() === l.targetTitle);
        return targetNode ? { source: l.source, target: targetNode.id } : null;
      }).filter(Boolean);

      setNodes(nodesData);
      setLinks(resolvedLinks);
    }
    loadGraph();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 h-[calc(100vh-6rem)] flex flex-col">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2 font-bold uppercase tracking-wider text-xs">
            <Share2 className="w-3.5 h-3.5" /> Second Brain
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Knowledge Graph</h1>
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
          Showing {nodes.length} Nodes & {links.length} Connections
        </p>
      </header>

      <div className="flex-1 bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
        <svg 
          ref={svgRef}
          viewBox="0 0 1000 700" 
          className="w-full h-full cursor-move"
        >
          {/* Simple static links */}
          {links.map((link, i) => {
            const source = nodes.find(n => n.id === link.source);
            const target = nodes.find(n => n.id === link.target);
            if (!source || !target) return null;
            return (
              <line 
                key={i} 
                x1={source.x} y1={source.y} 
                x2={target.x} y2={target.y} 
                stroke="#e5e7eb" 
                strokeWidth="1"
              />
            );
          })}

          {/* Simple static nodes */}
          {nodes.map((node) => (
            <g 
              key={node.id} 
              transform={`translate(${node.x},${node.y})`}
              className="cursor-pointer"
              onClick={() => navigatetoLink(node.title)}
            >
              <circle 
                r={node.type === 'collection' ? 8 : 5} 
                fill={node.type === 'collection' ? '#2563eb' : '#94a3b8'} 
                className="transition-all hover:scale-150 hover:fill-blue-500"
              />
              <text 
                dy="20" 
                textAnchor="middle" 
                className="text-[8px] font-bold fill-gray-400 pointer-events-none select-none uppercase tracking-tighter"
              >
                {node.title}
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute bottom-8 left-8 p-6 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-xl max-w-xs">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Zap className="w-3 h-3 text-yellow-500" /> Interactive Brain
          </h3>
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
            Every <strong>[[Link]]</strong> you write in your logs creates a synapse here. Click a node to travel to that moment in time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GraphView;
