import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, InputNumber, Menu } from 'antd';
import { Graph, Path, Node, Edge, Color } from '@antv/x6';
import { Container, MenuContainer } from './styled';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Keyboard } from "@antv/x6-plugin-keyboard";
import { Selection } from "@antv/x6-plugin-selection";
import { History } from "@antv/x6-plugin-history";
import { Dnd } from "@antv/x6-plugin-dnd";
import { SearchOutlined } from '@ant-design/icons';

import './style.module.scss';
import './style.css';

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

class Group extends Node {
  private collapsed = false
  private expandSize: { width: number; height: number } = { width: 0, height: 0 }

  protected postprocess() {
    this.toggleCollapse(false);
  }

  isCollapsed() {
    return this.collapsed;
  }

  toggleCollapse(collapsed?: boolean) {
    const target = collapsed == null ? !this.collapsed : collapsed;
    if (target) {
      this.attr('buttonSign', { d: 'M 1 5 9 5 M 5 1 5 9' })
      this.expandSize = this.getSize()
      this.resize(100, 32)
    } else {
      this.attr('buttonSign', { d: 'M 2 5 8 5' })
      if (this.expandSize) {
        this.resize(this.expandSize.width, this.expandSize.height)
      }
    }
    this.collapsed = target
  }
}

Group.config({
  markup: [
    {
      tagName: 'rect',
      selector: 'body',
    },
    {
      tagName: 'text',
      selector: 'label',
    },
    {
      tagName: 'g',
      selector: 'buttonGroup',
      children: [
        {
          tagName: 'rect',
          selector: 'button',
          attrs: {
            'pointer-events': 'visiblePainted',
          },
        },
        {
          tagName: 'path',
          selector: 'buttonSign',
          attrs: {
            fill: 'none',
            'pointer-events': 'none',
          },
        },
      ],
    },
  ],
  attrs: {
    body: {
      refWidth: '100%',
      refHeight: '100%',
      strokeWidth: 1,
      fill: '#ffffff',
      stroke: 'none',
    },
    buttonGroup: {
      refX: 8,
      refY: 8,
    },
    button: {
      height: 14,
      width: 16,
      rx: 2,
      ry: 2,
      fill: '#f5f5f5',
      stroke: '#ccc',
      cursor: 'pointer',
      event: 'node:collapse',
    },
    buttonSign: {
      refX: 3,
      refY: 2,
      stroke: '#808080',
    },
    label: {
      fontSize: 12,
      fill: '#fff',
      refX: 32,
      refY: 10,
    },
  },
});

const X6V = () => {
  const ref = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const dndRef = useRef<Dnd | null>(null);
  const selectedRef = useRef<Edge | Node | null>(null);
  const pendingNodesRef = useRef<Node[]>([]);

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
                animation: 'running-line 30s infinite linear',
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
          allowBlank: true, // 是否允许连接到画布空白位置的点
          allowLoop: true, // 是否允许创建循环连线
          highlight: true,
          connector: 'algo-connector',
          // connectionPoint: 'anchor',
          // anchor: 'center',
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

      // 连接线存在连接关系时
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
            },
          })
        }
      });

      // 连接线选中
      graph.on("edge:click", ({ e, x, y, edge, view }) => {
        selectedRef.current = edge;
      });

      // 节点选中
      graph.on("node:selected", ({ node }) => {
        // 最后一个选中的
        selectedRef.current = node;
        const nodes = graph.getSelectedCells() as Node[];
        if (nodes.length > 1) {
          pendingNodesRef.current = nodes;
        }
      });

      // 展开 / 收缩
      graph.on('node:collapse', (args: any) => {
        args.e.stopPropagation();
        const { node }: { node: Group } = args;
        node.toggleCollapse()
        const collapsed = node.isCollapsed()
        const collapse = (parent: Group) => {
          const cells = parent.getChildren()
          if (cells) {
            cells.forEach((cell) => {
              if (collapsed) {
                cell.hide()
              } else {
                cell.show()
              }
      
              if (cell instanceof Group) {
                if (!cell.isCollapsed()) {
                  collapse(cell)
                }
              }
            })
          }
        }
      
        collapse(node)
      });

      // 空白点击
      graph.on('blank:click', () => {
        selectedRef.current = null;
        pendingNodesRef.current = [];
      });

      // 撤销
      graph.bindKey('ctrl+z', () => {
        graph.undo();
      });

      // 删除
      graph.bindKey('backspace', () => {
        if (selectedRef.current) {
          if (selectedRef.current.shape.includes('edge')) {
            graphRef.current!.removeEdge(selectedRef.current.id);
          }
          if (selectedRef.current instanceof Node) {
            graphRef.current!.removeNode(selectedRef.current.id);
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

  const startDrag = (e: React.MouseEvent<HTMLElement, MouseEvent>, fields: any) => {
    if (!graphRef.current || !dndRef.current) return;
    // 该 node 为拖拽的节点，默认也是放置到画布上的节点，可以自定义任何属性
    const ports = fields.shape === 'text-block' ? {} : {
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
    };
    const node = graphRef.current.createNode({
      ...fields,
      ports,
      data: {}
    });
    dndRef.current.start(node, e.nativeEvent);
  };

  // 框选
  const handleSelection = () => {
    if (!graphRef.current || pendingNodesRef.current.length < 2) {
      return;
    }

    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;

    pendingNodesRef.current.forEach((v) => {
      const { x, y } = v.getPosition();
      const { width, height } = v.getSize();
      const sx = x;
      const sy = y;
      const ex = x + width;
      const ey = y + height;

      if (sx < minX) {
        minX = sx;
      }
      if (sy < minY) {
        minY = sy;
      }
      if (ex > maxX) {
        maxX = ex;
      }
      if (ey > maxY) {
        maxY = ey;
      }
    });
    const sizeHeight = 60;
    const parentWidth = maxX - minX + 40;
    const parentHeight = maxY - minY + sizeHeight;

    const group = new Group({
      shape: 'rect',
      x: minX - 20,
      y: minY - 40,
      width: parentWidth,
      height: parentHeight,
      zIndex: 0,
      attrs: {
        body: {
          fill: '#fffbe6',
          stroke: '#ffe7ba',
        },
        label: {
          fontSize: 12,
        },
      },
    });
    
    graphRef.current.addNode(group);

    pendingNodesRef.current.forEach((v) => {
      group.addChild(v);
    });

    pendingNodesRef.current = [];
    graphRef.current.cleanSelection();
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
          onMouseDown: (e: React.MouseEvent<HTMLElement, MouseEvent>) => startDrag(e, { shape: 'rect', width: 100, height: 40, label: 'rect1', attrs: commonAttrs }),
        },
        {
          label: 'rect2',
          key: 'rect2',
          icon: null,
          onMouseDown: (e: React.MouseEvent<HTMLElement, MouseEvent>) => startDrag(e, { shape: 'rect', width: 100, height: 40, label: 'rect2', attrs: commonAttrs }),
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
          onMouseDown: (e: React.MouseEvent<HTMLElement, MouseEvent>) => startDrag(e, { shape: 'rect', width: 100, height: 40, label: 'circle1', attrs: commonAttrs }),
        },
        {
          label: 'circle2',
          key: 'circle2',
          icon: null,
          onMouseDown: (e: React.MouseEvent<HTMLElement, MouseEvent>) => startDrag(e, { shape: 'rect', width: 100, height: 40, label: 'circle2', attrs: commonAttrs }),
        }
      ]
    },
    {
      label: 'group3',
      key: 'group3',
      icon: null,
      children: [
        {
          label: 'text1',
          key: 'text1',
          icon: null,
          onMouseDown: (e: React.MouseEvent<HTMLElement, MouseEvent>) => startDrag(e, {
            shape: 'text-block',
            width: 120,
            height: 36,
            text: '',
            attrs: {
              body: {
                rx: 4,
                ry: 4,
                fill: 'transparent',
                stroke: '#ddd',
              },
            }
          }),
        },
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
      <div>
        <div>
          <Button onClick={handleSelection}>框选</Button>
          <Button>单机</Button>
        </div>
        <div ref={ref} />
      </div>
        <div>
          <Input.TextArea
            style={{ width: 300, height: 200 }}
            onBlur={(e) => {
              const text = e.target.value;
              selectedRef.current!.attr('label/text', text);
            }}
          />
          宽：
          <InputNumber
            onBlur={(e) => {
              const width = +e.target.value;
              const size = (selectedRef.current as Node)!.getSize();
              selectedRef.current!.prop('size', { ...size, width });
            }}
          />
          高：
          <InputNumber
            onBlur={(e) => {
              const height = +e.target.value;
              const size = (selectedRef.current as Node)!.getSize();
              selectedRef.current!.prop('size', { ...size, height });
            }}
          />
        </div>
    </Container>
  );
};

export default X6V;