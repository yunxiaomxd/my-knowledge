import { useEffect, useRef, useState } from 'react';
import { Input, Menu } from 'antd';
import { Graph, Path, Node, Edge } from '@antv/x6';
import { Container, MenuContainer } from './styled';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Keyboard } from "@antv/x6-plugin-keyboard";
import { Selection } from "@antv/x6-plugin-selection";
import { History } from "@antv/x6-plugin-history";
import { Dnd } from "@antv/x6-plugin-dnd";

import './style.module.scss';
import { SearchOutlined } from '@ant-design/icons';

const portAttrs = {
  circle: {
    magnet: true,
    r: 4,
    stroke: '#31d0c6',
    fill: '#fff',
    strokeWidth: 2,
  }
};

const commonAttrs = {
  body: {
    fill: '#fff',
    stroke: '#8f8f8f',
    strokeWidth: 1,
  },
}

const X6V = () => {
  const ref = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const dndRef = useRef<Dnd | null>(null);
  const selectedRef = useRef<Edge | Node | null>(null);
  const [nodes, setNodes] = useState<Node<Node.Properties>[]>([]);

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
          connector: { name: 'smooth' },
          attrs: {
            line: {
              stroke: '#C2C8D5',
              strokeDasharray: 5,
              targetMarker: 'classic',
              style: {
                animation: 'ant-line 30s infinite linear',
              },
            },
          },
        },
        true,
      )

      const graph: Graph = new Graph({
        container: ref.current,
        width: 800,
        height: 600,
        background: {
          color: "#F2F7FA",
        },
        // panning: {
        //   enabled: true,
        //   eventTypes: ['leftMouseDown', 'mouseWheel'],
        // },
        mousewheel: {
          enabled: true,
          modifiers: 'ctrl',
          factor: 1.1,
          maxScale: 1.5,
          minScale: 0.5,
        },
        highlighting: {
          magnetAdsorbed: {
            name: 'stroke',
            args: {
              attrs: {
                fill: '#fff',
                stroke: '#31d0c6',
                strokeWidth: 4,
              },
            },
          },
        },
        connecting: {
          snap: true, // 自动吸附
          allowBlank: false, // 是否允许连接到画布空白位置的点
          allowLoop: false, // 是否允许创建循环连线
          highlight: true,
          connector: 'algo-connector',
          connectionPoint: 'anchor',
          anchor: 'center',
          validateMagnet({ magnet }) {
            return magnet.getAttribute('port-group') !== 'top'
          },
          createEdge() {
            return graph.createEdge({
              shape: 'dag-edge',
            })
          },
        },
      });
      graph.use(
        new History({
          enabled: true,
        })
      );

      graph.use(
        new Snapline({
          enabled: true,
        })
      );

      graph.use(
        new Keyboard({
          enabled: true,
        })
      );

      graph.use(
        new Selection({
          enabled: true,
          multiple: true,
          rubberband: true,
          movable: true,
          showNodeSelectionBox: true,
        }),
      );

      graph.on('edge:connected', ({ isNew, edge }) => {
        if (isNew) {
          const { id, source, target } = edge;
          graph.addEdge({
            id,
            shape: 'dag-edge',
            source: {
              ...source,
            },
            target: {
              ...target,
            }
          })
        }
      });

      graph.on("edge:click", ({ e, x, y, edge, view }) => {
        selectedRef.current = edge;
      });

      // 撤销
      graph.bindKey('ctrl+z', () => {
        graph.undo();
      });

      graph.bindKey('backspace', () => {
        if (selectedRef.current) {
          if (selectedRef.current.shape.includes('edge')) {
            graphRef.current!.removeEdge(selectedRef.current.id);
          }
        }
      });

      graphRef.current = graph;
    }
  }, []);

  useEffect(() => {
    if (!graphRef.current) {
      return;
    }
    dndRef.current = new Dnd({
      target: graphRef.current,
    });
  }, [graphRef.current]);

  const handleAdd = (shape: string) => {
    if (!graphRef.current) {
      return;
    }
    const node: Node.Metadata = {
      shape,
      x: 40,
      y: 40,
      width: 80,
      height: 40,
      label: shape,
      attrs: commonAttrs,
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: { ...portAttrs },
          },
          bottom: {
            position: 'bottom',
            attrs: { ...portAttrs },
          }
        },
        items: [
          { group: 'top', id: 'top1' },
          { group: 'bottom', id: 'bottom1' },
        ]
      },
      data: {}
    }
    const resNode = graphRef.current.addNode(node);
    setNodes((old) => ([...old, resNode]));
  };

  const handleAddEdge = () => {

  }

  const startDrag = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!graphRef.current || !dndRef.current) return;
    // 该 node 为拖拽的节点，默认也是放置到画布上的节点，可以自定义任何属性
    const node = graphRef.current.createNode({
      shape: "rect",
      width: 100,
      height: 40,
      label: 'rect',
      attrs: commonAttrs,
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: { ...portAttrs },
          },
          bottom: {
            position: 'bottom',
            attrs: { ...portAttrs },
          }
        },
        items: [
          { group: 'top', id: 'top1' },
          { group: 'bottom', id: 'bottom1' },
        ]
      },
      data: {}
    });
    dndRef.current.start(node, e.nativeEvent);
  };

  const menuList = [
    {
      label: 'group1',
      key: 'group1',
      icon: null,
      children: [
        {
          label: 'rect1',
          key: 'rect1',
          icon: null,
          onMouseDown: startDrag,
        },
        {
          label: 'rect2',
          key: 'rect2',
          icon: null,
          onMouseDown: startDrag,
        }
      ]
    },
    {
      label: 'group2',
      key: 'group2',
      icon: null,
      children: [
        {
          label: 'circle1',
          key: 'circle1',
          icon: null,
          onMouseDown: startDrag,
        },
        {
          label: 'circle2',
          key: 'circle2',
          icon: null,
          onMouseDown: startDrag,
        }
      ]
    }
  ];

  return (
    <Container>
      <MenuContainer>
        <div>
          <div>title</div>
          <Input suffix={<SearchOutlined />} />
        </div>
        <Menu mode="inline" items={menuList} />
      </MenuContainer>
      <div ref={ref} />
    </Container>
  );
};

export default X6V;