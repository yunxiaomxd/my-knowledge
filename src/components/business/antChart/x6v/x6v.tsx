import { Graph, Path, Shape, Cell } from '@antv/x6';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../componentList';
import { Container } from './styled';

const commonAttrs = {
  body: {
    fill: '#fff',
    stroke: '#8f8f8f',
    strokeWidth: 1,
  },
  // label: {
  //   refX: 0.5,
  //   refY: '100%',
  //   refY2: 4,
  //   textAnchor: 'middle',
  //   textVerticalAnchor: 'top',
  // },
}

const X6V = () => {
  const ref = useRef<HTMLDivElement>(null);
  const graghRef = useRef<Graph | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);

  useEffect(() => {
    if (ref.current) {
      Graph.registerConnector(
        'algo-connector',
        (s, e) => {
          const offset = 4
          const deltaY = Math.abs(e.y - s.y)
          const control = Math.floor((deltaY / 3) * 2)
      
          const v1 = { x: s.x, y: s.y + offset + control }
          const v2 = { x: e.x, y: e.y - offset - control }
      
          return Path.normalize(
            `M ${s.x} ${s.y}
             L ${s.x} ${s.y + offset}
             C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x} ${e.y - offset}
             L ${e.x} ${e.y}
            `,
          )
        },
        true,
      )

      Graph.registerEdge(
        'dag-edge',
        {
          inherit: 'edge',
          attrs: {
            line: {
              stroke: '#C2C8D5',
              strokeWidth: 1,
              targetMarker: null,
            },
          },
        },
        true,
      )

      const graph = new Graph({
        container: ref.current,
        width: 800,
        height: 600,
        background: {
          color: "#F2F7FA",
        },
      });

      graghRef.current = graph;
    }
  }, [ref]);

  const handleAdd = (shape: string) => {
    if (!graghRef.current) {
      return;
    }
    const node = {
      shape,
      x: 40,
      y: 40,
      width: 80,
      height: 40,
      label: shape,
      attrs: commonAttrs,
    }
    cells.push(graghRef.current.createNode(node));
    graghRef.current.resetCells(cells);
  };

  return (
    <Container>
      <div>
        <Button onClick={() => handleAdd('rect')}>rect</Button>
        <Button onClick={() => handleAdd('circle')}>circle</Button>
      </div>
      <br />
      <div ref={ref} />
    </Container>
  );
};

export default X6V;