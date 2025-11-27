import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const NetworkGraph = ({ data, highlightedNodes, onNodeClick, onLinkClick, hideBottomNodes = 5, colorMap = {} }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const containerWidth = svgRef.current.clientWidth;
    const containerHeight = svgRef.current.clientHeight;
    
    // Add padding to prevent nodes from being cut off
    const padding = 40;
    const width = containerWidth - (padding * 2);
    const height = containerHeight - (padding * 2);

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    // Tooltip 생성
    const tooltip = d3.select('body').append('div')
      .attr('class', 'network-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.85)')
      .style('color', 'white')
      .style('padding', '10px 14px')
      .style('border-radius', '6px')
      .style('font-size', '13px')
      .style('font-weight', '500')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)');

    const g = svg.append('g')
      .attr('transform', `translate(${padding}, ${padding})`);

    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', `translate(${padding + event.transform.x}, ${padding + event.transform.y}) scale(${event.transform.k})`);
      });
    
    svg.call(zoom);

    // Use fixed color map
    const getColor = (nodeId) => {
      return colorMap[nodeId] || '#999999';  // fallback color
    };

    // 노드 필터링: hideBottomNodes 값에 따라 하위 N개 제거
    let filteredNodes = data.nodes;
    let nodesToRemove = [];
    
    if (hideBottomNodes > 0) {
      const sortedNodes = [...data.nodes].sort((a, b) => b.size - a.size);
      nodesToRemove = sortedNodes.slice(-hideBottomNodes).map(n => n.id);
      filteredNodes = data.nodes.filter(n => !nodesToRemove.includes(n.id));
    }
    
    const filteredLinks = data.links.filter(l => 
      !nodesToRemove.includes(l.source.id || l.source) && 
      !nodesToRemove.includes(l.target.id || l.target)
    );

    // Link weight 분석
    const weights = filteredLinks.map(l => l.weight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const weightThreshold = minWeight + (maxWeight - minWeight) * 0.3;

    // Stroke width scale function
    const getStrokeWidth = (weight) => {
      const minWidth = 1;
      const maxWidth = 6;
      const normalized = (weight - minWeight) / (maxWeight - minWeight);
      return minWidth + normalized * (maxWidth - minWidth);
    };

    // Helper function to check if a link is the selected/highlighted link
    const isHighlightedLink = (link) => {
      if (highlightedNodes.length !== 2) return false;
      const sourceId = link.source.id || link.source;
      const targetId = link.target.id || link.target;
      return (highlightedNodes.includes(sourceId) && highlightedNodes.includes(targetId));
    };

    // Force simulation with adjusted parameters
    const simulation = d3.forceSimulation(filteredNodes)
      .force('link', d3.forceLink(filteredLinks).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Links - 강도에 따라 차별화 + 클릭 가능
    // Separate self-loops and regular links
    const selfLoops = filteredLinks.filter(d => {
      const sourceId = d.source.id || d.source;
      const targetId = d.target.id || d.target;
      return sourceId === targetId;
    });
    
    const regularLinks = filteredLinks.filter(d => {
      const sourceId = d.source.id || d.source;
      const targetId = d.target.id || d.target;
      return sourceId !== targetId;
    });
    
    // Draw regular links as lines
    const link = g.append('g')
      .selectAll('line')
      .data(regularLinks)
      .join('line')
      .attr('stroke', d => {
        // If this link is highlighted, use highlight color
        if (isHighlightedLink(d)) {
          return '#2ecc71';
        }
        // Otherwise use weight-based color
        if (d.weight >= weightThreshold) {
          return '#555';
        } else {
          return '#ddd';
        }
      })
      .attr('stroke-opacity', d => {
        // If this link is highlighted, high opacity
        if (isHighlightedLink(d)) {
          return 0.9;
        }
        // If we're in filter mode but this link is not highlighted, dim it
        if (highlightedNodes.length === 2) {
          return 0.1;
        }
        // Normal mode: opacity based on weight
        if (d.weight >= weightThreshold) {
          const normalized = (d.weight - weightThreshold) / (maxWeight - weightThreshold);
          return 0.5 + normalized * 0.4;
        } else {
          return 0.15;
        }
      })
      .attr('stroke-width', d => {
        // If this link is highlighted, make it thicker
        if (isHighlightedLink(d)) {
          return 6;
        }
        return getStrokeWidth(d.weight);
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        const sourceId = d.source.id || d.source;
        const targetId = d.target.id || d.target;
        if (onLinkClick) {
          onLinkClick(sourceId, targetId);
        }
      })
      .on('mouseover', function(event, d) {
        const hoveredLink = d3.select(this);
        const sourceId = d.source.id || d.source;
        const targetId = d.target.id || d.target;
        
        // 툴팁 표시 - 링크의 concept pair 개수
        const pairCount = d.weight || 0;
        tooltip.html(`<strong>Concept Pairs:</strong> ${pairCount}`)
          .style('visibility', 'visible')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
        
        // 링크 강조 - 약한 링크도 굵게
        hoveredLink
          .attr('stroke', '#2196f3')
          .attr('stroke-width', 6)
          .attr('stroke-opacity', 0.8);
        
        // 연결된 노드 강조
        node.selectAll('circle')
          .attr('stroke-width', function(nodeData) {
            const nodeId = nodeData.id;
            if (nodeId === sourceId || nodeId === targetId) {
              return 4;
            }
            return highlightedNodes.includes(nodeId) ? 3 : 2;
          })
          .attr('opacity', function(nodeData) {
            const nodeId = nodeData.id;
            if (nodeId === sourceId || nodeId === targetId) {
              return 1.0;
            }
            if (highlightedNodes.length > 0) {
              return highlightedNodes.includes(nodeId) ? 1.0 : 0.25;
            }
            return 0.4;
          });
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        const link = d3.select(this);
        
        tooltip.style('visibility', 'hidden');
        
        // Restore highlighted or normal state
        if (isHighlightedLink(d)) {
          link
            .attr('stroke', '#2ecc71')
            .attr('stroke-width', 6)
            .attr('stroke-opacity', 0.9);
        } else {
          link
            .attr('stroke', d.weight >= weightThreshold ? '#555' : '#ddd')
            .attr('stroke-width', getStrokeWidth(d.weight))
            .attr('stroke-opacity', () => {
              // If in filter mode, dim non-highlighted links
              if (highlightedNodes.length === 2) {
                return 0.1;
              }
              // Normal mode
              if (d.weight >= weightThreshold) {
                const normalized = (d.weight - weightThreshold) / (maxWeight - weightThreshold);
                return 0.5 + normalized * 0.4;
              }
              return 0.15;
            });
        }
        
        node.selectAll('circle')
          .attr('stroke-width', d => highlightedNodes.includes(d.id) ? 3 : 2)
          .attr('opacity', d => {
            if (highlightedNodes.length > 0) {
              return highlightedNodes.includes(d.id) ? 1.0 : 0.25;
            }
            return 1.0;
          });
      });

    const node = g.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .join('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Improved node sizing: more visible size differences
    // Use power scale for better visual differentiation
    const sizeScale = d3.scalePow()
      .exponent(0.6)  // Makes differences more pronounced
      .domain([0, d3.max(filteredNodes, d => d.size)])
      .range([12, 45]);  // Larger range for better differentiation

    node.append('circle')
      .attr('r', d => sizeScale(d.size))
      .attr('fill', d => getColor(d.id))  // Use fixed color from colorMap
      .attr('stroke', d => {
        if (highlightedNodes.includes(d.id)) {
          return d3.color(getColor(d.id)).darker(1.5);
        }
        return '#fff';
      })
      .attr('stroke-width', d => highlightedNodes.includes(d.id) ? 3 : 2)
      .attr('opacity', d => {
        if (highlightedNodes.length > 0) {
          return highlightedNodes.includes(d.id) ? 1.0 : 0.25;
        }
        return 1.0;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d.id);
      })
      .on('mouseover', function(event, d) {
        const pairCount = d.size || 0;
        tooltip.html(`<strong>Community:</strong> ${d.label}<br/><strong>Concept Pairs:</strong> ${pairCount}`)
          .style('visibility', 'visible')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
        
        d3.select(this)
          .attr('stroke-width', 4)
          .attr('r', sizeScale(d.size) * 1.2);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        tooltip.style('visibility', 'hidden');
        
        d3.select(this)
          .attr('stroke-width', highlightedNodes.includes(d.id) ? 3 : 2)
          .attr('r', sizeScale(d.size));
      });

    // Labels
    const labelGroup = node.append('g');
    
    const text = labelGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => sizeScale(d.size) + 16)
      .attr('fill', '#2c3e50')
      .attr('font-weight', '600')
      .attr('opacity', d => {
        if (highlightedNodes.length > 0) {
          return highlightedNodes.includes(d.id) ? 1.0 : 0.3;
        }
        return 1.0;
      })
      .style('pointer-events', 'none');

    // Split long text into multiple lines
    text.each(function(d) {
      const textElement = d3.select(this);
      const words = d.label.split(' ');
      const lineHeight = 1.2;
      const maxCharsPerLine = 20;
      
      let line = [];
      let lineNumber = 0;
      let tspan = textElement.append('tspan')
        .attr('x', 0)
        .attr('dy', 0)
        .attr('font-size', '11px');
      
      words.forEach((word, i) => {
        line.push(word);
        tspan.text(line.join(' '));
        
        if (tspan.node().getComputedTextLength() > maxCharsPerLine * 5.5 && line.length > 1) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          lineNumber++;
          tspan = textElement.append('tspan')
            .attr('x', 0)
            .attr('dy', lineHeight + 'em')
            .attr('font-size', '11px')
            .text(word);
        }
      });
    });

    // Label background
    text.each(function(d) {
      const bbox = this.getBBox();
      const isHighlighted = highlightedNodes.includes(d.id);
      const opacity = highlightedNodes.length > 0 && !isHighlighted ? 0.3 : 0.7;
      
      d3.select(this.parentNode).insert('rect', 'text')
        .attr('x', bbox.x - 4)
        .attr('y', bbox.y - 2)
        .attr('width', bbox.width + 8)
        .attr('height', bbox.height + 4)
        .attr('fill', 'white')
        .attr('fill-opacity', opacity)
        .attr('rx', 3)
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 0.5);
    });
    
    // Draw self-loops as arcs
    const selfLoopGroup = g.append('g');
    const selfLoopPaths = selfLoopGroup
      .selectAll('path')
      .data(selfLoops)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', d => {
        if (isHighlightedLink(d)) {
          return '#2ecc71';
        }
        if (d.weight >= weightThreshold) {
          return '#555';
        } else {
          return '#ddd';
        }
      })
      .attr('stroke-opacity', d => {
        if (isHighlightedLink(d)) {
          return 0.9;
        }
        if (highlightedNodes.length === 2) {
          return 0.1;
        }
        if (d.weight >= weightThreshold) {
          const normalized = (d.weight - weightThreshold) / (maxWeight - weightThreshold);
          return 0.5 + normalized * 0.4;
        } else {
          return 0.15;
        }
      })
      .attr('stroke-width', d => {
        if (isHighlightedLink(d)) {
          return 6;
        }
        return getStrokeWidth(d.weight);
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        const sourceId = d.source.id || d.source;
        if (onLinkClick) {
          onLinkClick(sourceId, sourceId);
        }
      })
      .on('mouseover', function(event, d) {
        const hoveredPath = d3.select(this);
        const pairCount = d.weight || 0;
        tooltip.html(`<strong>Within-Community Pairs:</strong> ${pairCount}`)
          .style('visibility', 'visible')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
        
        hoveredPath
          .attr('stroke', '#2196f3')
          .attr('stroke-width', 6)
          .attr('stroke-opacity', 0.8);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        const path = d3.select(this);
        tooltip.style('visibility', 'hidden');
        
        if (isHighlightedLink(d)) {
          path
            .attr('stroke', '#2ecc71')
            .attr('stroke-width', 6)
            .attr('stroke-opacity', 0.9);
        } else {
          path
            .attr('stroke', d.weight >= weightThreshold ? '#555' : '#ddd')
            .attr('stroke-width', getStrokeWidth(d.weight))
            .attr('stroke-opacity', () => {
              if (highlightedNodes.length === 2) {
                return 0.1;
              }
              if (d.weight >= weightThreshold) {
                const normalized = (d.weight - weightThreshold) / (maxWeight - weightThreshold);
                return 0.5 + normalized * 0.4;
              }
              return 0.15;
            });
        }
      });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
      tooltip.remove();
    };

  }, [data, highlightedNodes, onNodeClick, onLinkClick, hideBottomNodes, colorMap]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: '100%',
        height: '100%',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        background: '#fafafa'
      }}
    />
  );
};

export default NetworkGraph;