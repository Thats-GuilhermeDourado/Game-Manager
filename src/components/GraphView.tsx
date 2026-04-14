import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'scroll' | 'monster' | 'note' | 'character';
  color?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
}

interface GraphViewProps {
  nodes: Node[];
  links: Link[];
  onNodeClick?: (node: Node) => void;
}

export default function GraphView({ nodes, links, onNodeClick }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#D4AF37')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-width', 1);

    const node = g.append('g')
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (event, d) => onNodeClick?.(d))
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', d => d.type === 'monster' ? 12 : 8)
      .attr('fill', d => {
        if (d.type === 'monster') return '#EF4444';
        if (d.type === 'scroll') return '#D4AF37';
        if (d.type === 'character') return '#10B981';
        return '#60A5FA';
      })
      .attr('stroke', '#141414')
      .attr('stroke-width', 2);

    node.append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#E4E3E0')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('class', 'pointer-events-none uppercase tracking-widest')
      .text(d => d.name);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, onNodeClick]);

  return (
    <div className="w-full h-full bg-midnight/40 rounded-3xl border border-gold/10 overflow-hidden relative">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[8px] font-bold text-parchment/40 uppercase tracking-widest">Monsters</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span className="text-[8px] font-bold text-parchment/40 uppercase tracking-widest">Scrolls</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-[8px] font-bold text-parchment/40 uppercase tracking-widest">Notes</span>
        </div>
      </div>
    </div>
  );
}
