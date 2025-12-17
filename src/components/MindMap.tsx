import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MindMapNode } from '../types';

interface MindMapProps {
  data: MindMapNode;
}

const MindMap: React.FC<MindMapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setDimensions({
          width: wrapperRef.current.offsetWidth,
          height: 600, // Fixed height or dynamic
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const { width, height } = dimensions;
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };

    // Clear previous SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%');

    // Add Zoom behavior
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    // Center initial view slightly
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(margin.left, margin.top).scale(0.8),
    );

    let i = 0;
    const duration = 500;

    // Hierarchy and Tree Layout
    const root = d3.hierarchy<MindMapNode>(data);

    // @ts-ignore - D3 typing specifically for 'x0' and 'y0' on custom objects
    root.x0 = height / 2;
    // @ts-ignore
    root.y0 = 0;

    // Collapse function to hide children initially (except depth 1)
    const collapse = (d: any) => {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    };

    // Collapse all branches initially (except the root itself)
    if (root.children) {
      root.children.forEach(collapse);
    }

    // AUMENTADO O ESPAÇAMENTO AQUI
    // [Vertical Spacing, Horizontal Spacing]
    // Antes: [40, 180] -> Agora: [80, 250] para dar mais respiro vertical
    const tree = d3.tree<MindMapNode>().nodeSize([80, 250]);

    update(root);

    function update(source: any) {
      const treeData = tree(root);

      // Nodes
      const nodes = treeData.descendants();
      const links = treeData.links();

      // Normalize for fixed-depth (horizontal spacing control)
      nodes.forEach((d: any) => {
        d.y = d.depth * 250;
      });

      // ****************** Nodes section ******************
      const node = g
        .selectAll<SVGGElement, any>('g.node')
        .data(nodes, (d: any) => d.id || (d.id = ++i));

      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr(
          'transform',
          (d: any) => 'translate(' + source.y0 + ',' + source.x0 + ')',
        )
        .on('click', click)
        .style('cursor', 'pointer');

      // Add Circle for the nodes
      nodeEnter
        .append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style('fill', (d: any) => (d._children ? '#6366f1' : '#fff')) // Blue if collapsed children
        .style('stroke', '#6366f1')
        .style('stroke-width', '2.5px');

      // Add labels
      nodeEnter
        .append('text')
        .attr('dy', '.35em')
        .attr('x', (d: any) => (d.children || d._children ? -20 : 20))
        .attr('text-anchor', (d: any) =>
          d.children || d._children ? 'end' : 'start',
        )
        .text((d: any) => d.data.name)
        .style('font-size', '14px')
        .style('font-family', 'Inter, sans-serif')
        .style('fill', '#374151')
        .style('font-weight', '500')
        .style('fill-opacity', 1e-6)
        .call(wrap, 220); // Aumentado limite de quebra de linha

      // UPDATE
      const nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position
      nodeUpdate
        .transition()
        .duration(duration)
        .attr('transform', (d: any) => 'translate(' + d.y + ',' + d.x + ')');

      // Update the circle attributes
      nodeUpdate
        .select('circle.node')
        .attr('r', 8)
        .style('fill', (d: any) => (d._children ? '#6366f1' : '#fff'))
        .attr('cursor', 'pointer');

      // Update text opacity
      nodeUpdate.select('text').style('fill-opacity', 1);

      // Exit any old nodes
      const nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr(
          'transform',
          (d: any) => 'translate(' + source.y + ',' + source.x + ')',
        )
        .remove();

      nodeExit.select('circle').attr('r', 1e-6);

      nodeExit.select('text').style('fill-opacity', 1e-6);

      // ****************** Links section ******************
      const link = g
        .selectAll<SVGPathElement, any>('path.link')
        .data(links, (d: any) => d.target.id);

      // Enter any new links at the parent's previous position
      const linkEnter = link
        .enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .attr('d', (d: any) => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        })
        .style('fill', 'none')
        .style('stroke', '#cbd5e1')
        .style('stroke-width', '2px');

      // UPDATE
      const linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate
        .transition()
        .duration(duration)
        .attr('d', (d: any) => diagonal(d.source, d.target));

      // Remove any exiting links
      link
        .exit()
        .transition()
        .duration(duration)
        .attr('d', (d: any) => {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      // Store the old positions for transition
      nodes.forEach((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      function diagonal(s: any, d: any) {
        return `M ${s.y} ${s.x}
                    C ${(s.y + d.y) / 2} ${s.x},
                      ${(s.y + d.y) / 2} ${d.x},
                      ${d.y} ${d.x}`;
      }

      // Toggle children on click
      function click(event: any, d: any) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }
    }

    // Utility for text wrapping
    function wrap(text: any, width: number) {
      text.each(function (this: any) {
        const self = d3.select(this);
        let textLength = self.text().length;
        let textContent = self.text();

        // Basic truncation logic for D3/SVG
        if (textLength > 30) {
          self.text(textContent.substring(0, 30) + '...');
          self.append('title').text(textContent); // Tooltip
        }
      });
    }
  }, [data, dimensions]);

  if (!data)
    return (
      <div className="text-gray-500 text-center py-10">
        Nenhum mapa mental gerado.
      </div>
    );

  return (
    <div
      ref={wrapperRef}
      className="w-full h-[600px] bg-gray-50 rounded-xl shadow-inner border border-gray-200 relative overflow-hidden"
    >
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur p-2 rounded-lg text-xs text-gray-500 shadow-sm pointer-events-none">
        Use o scroll para zoom • Arraste para mover • Clique nos pontos azuis
      </div>
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      ></svg>
    </div>
  );
};

export default MindMap;
