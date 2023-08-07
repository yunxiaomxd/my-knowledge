import React, { useEffect, useRef, useState } from "react";

const text = `我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁是谁我我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁是谁我
我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁
我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁
我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁`;

interface IPosition {
  x: number;
}

interface ITextRelationShipItem {
  s: IPosition;
  e: IPosition;
  level: number;
  text: string;
  id: string | number;
  originKeyIndex: number;
  targetKeyIndex: number;
}

interface ITextItem {
  text: string;
  id: string;
  keys: { s: number; e: number }[];
  relationShips: ITextRelationShipItem[];
}

const perHeight = 50;

const TextMark = () => {
  const moveRef = useRef<Boolean>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number>(0);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [textLine, setTextLine] = useState<ITextItem[]>(text.split('\n').map((v) => {
    return {
      text: v,
      id: Math.random().toString(),
      keys: [],
      relationShips: [],
    };
  }));
  const selectionRef = useRef<any>();

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, row: number) => {
    const ele = e.target as HTMLSpanElement;
    if (ele.getAttribute('data-selected')) {
      const index = +ele.getAttribute('data-index')!;
      const textItem = textLine[row];
      const key = textItem.keys[index];
      const { s, e } = key;

      const nodes = Array.from(ele.parentElement!.childNodes);
      const start = nodes[s] as HTMLSpanElement;
      const end = nodes[e] as HTMLSpanElement;

      const nodeStart = start.offsetLeft - 40;
      const nodeEnd = end.offsetLeft + end.offsetWidth - 40;

      let level = 1;
      const list = textItem.relationShips.filter((v) => v.originKeyIndex === index || v.targetKeyIndex === index).sort((a, b) => b.level - a.level);

      if (list.length > 0) {
        level = list[0].level + 1;
      }

      const x = (nodeStart + nodeEnd) / 2;
      const y = perHeight * level;

      setTextLine((list) => {
        return list.map((item, i) => {
          if (i === row) {
            return {
              ...item,
              relationShips: [
                ...item.relationShips,
                {
                  s: { x, y },
                  e: { x, y },
                  level,
                  text: '归类处理',
                  id: Math.random(),
                  originKeyIndex: index,
                  targetKeyIndex: -1,
                }
              ],
            }
          }
          return item;
        });
      });

      moveRef.current = true;

      return;
    }
    selectionRef.current = { element: e.target, row };
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLSpanElement>, row: number) => {
    if (moveRef.current) {
      const target = e.target as HTMLSpanElement;
      const keyIndex = target.getAttribute('data-index');
      const selected = target.getAttribute('data-selected');
      if (selected && keyIndex != null) {
        setTextLine((list) => {
          return list.map((item, i) => {
            if (i === row) {
              return {
                ...item,
                relationShips: item.relationShips.map((ship, index) => {
                  if (index === item.relationShips.length - 1) {
                    return { ...ship, targetKeyIndex: +keyIndex };
                  }
                  return ship;
                })
              }
            }
            return item;
          });
        });
      }
      moveRef.current = false;
      return;
    }

    const selection = window.getSelection();
    const text = selection?.toString();
    const start = selectionRef.current;
    const end = selection!.focusNode?.parentElement;
    if (text && start && start.element && end) {
      const startEqual = selection!.anchorNode?.parentElement === start.element;
      const container = end.parentElement!;
      const nodes = Array.from(container.childNodes);
      const startIndex = nodes.indexOf(startEqual ? start.element : selection!.anchorNode?.parentElement);
      const endIndex = nodes.indexOf(end);

      const newTextLine = textLine.map((item, index) => {
        if (row === index) {
          return { ...item, keys: [...item.keys, { s: startIndex, e: endIndex }] };
        }
        return item;
      });

      setTextLine(newTextLine);
      selectionRef.current = null;
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, row: number) => {
    if (!moveRef.current) {
      return;
    }

    const target = e.currentTarget as HTMLDivElement;

    const boundingRect = target.getBoundingClientRect();

    setTextLine((list) => {
      return list.map((item, i) => {
        if (i === row) {
          return {
            ...item,
            relationShips: item.relationShips.map((ship, index) => {
              if (index === item.relationShips.length - 1) {
                return { ...ship, e: { x: e.clientX - boundingRect.x + target.scrollLeft - 40, y: perHeight * ship.level } }
              }
              return ship;
            })
          }
        }
        return item;
      });
    });
  }

  const edgeAnimation = (type: string) => {
    const ele = containerRef.current!;
    if (type === '1') {
      if (ele.scrollLeft + ele.offsetWidth < ele.scrollWidth) {
        ele.scrollLeft = ele.scrollLeft + 10;
      } else {
        handleEdgeLeave();
        return;
      }
    } 
    if (type === '2') {
      if (ele.scrollLeft > 0) {
        ele.scrollLeft = ele.scrollLeft - 10;
      } else {
        handleEdgeLeave();
        return;
      }
    }
    timerRef.current = requestAnimationFrame(() => {
      edgeAnimation(type);
    });
  }

  const handleEdgeEnter = (type: string) => {
    edgeAnimation(type);
  }

  const handleEdgeLeave = () => {
    cancelAnimationFrame(timerRef.current);
  }

  useEffect(() => {
    containerRef.current && setScrollWidth(containerRef.current.scrollWidth);
  }, [containerRef.current]);

  const renderSvg = (list: ITextRelationShipItem[]) => {
    if (list.length === 0 || !containerRef.current) {
      return null;
    }

    let max = 1;
    list.forEach((v) => {
      if (v.level > max) {
        max = v.level;
      }
    });

    const svgHeight = max * perHeight;

    return (
      <svg width={scrollWidth} height={max * perHeight} xmlns="http://www.w3.org/2000/svg" version="1.1">
        {
          list.map((v) => {
            const startX = v.s.x;
            const endX = v.e.x;

            const rectLeftX = (startX + endX) / 2 - perHeight;
            const rectRightX = (startX + endX) / 2 + perHeight;
            const rectCenterY = (max - v.level) * perHeight + 25;

            const rectWidth = rectRightX - rectLeftX;
            const rectHeight = 32;
            const rectY = rectCenterY - rectHeight / 2;

            return (
              <g key={v.id}>
                <polyline points={`${startX},${svgHeight} ${startX},${rectCenterY} ${rectLeftX},${rectCenterY}`} style={{ fill: 'transparent', stroke: 'rgb(255,0,0)', strokeWidth: 2 }} />
                <foreignObject width={rectWidth} height={rectHeight} x={rectLeftX} y={rectY}>
                  <div
                    style={{ width: '100%', height: '100%', background:'#00c4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {v.text}
                  </div>
                </foreignObject>
                <polyline points={`${rectRightX},${rectCenterY} ${endX},${rectCenterY} ${endX},${svgHeight}`} x1={rectRightX} style={{ fill: 'transparent', stroke: 'rgb(255,0,0)', strokeWidth: 2 }} />
              </g>
            )
          })
        }
      </svg>
    )
  }

  return (
    <div style={{ boxSizing: 'border-box', width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <div
        onMouseEnter={() => handleEdgeEnter('2')}
        onMouseLeave={() => handleEdgeLeave()}
        style={{ position: 'absolute', top: 0, left: 0, width: 40, height: '100%', zIndex: 1 }}
      />
      <div ref={containerRef} style={{ padding: '40px 0', boxSizing: 'border-box', overflow: 'auto', whiteSpace: 'nowrap', width: '100%', height: '100%', position: 'relative' }}>
        {
          textLine.map((v, row) => {
            const length = v.text.length;
            return (
              <div key={v.id} style={{ lineHeight: 1, width: 'max-content', padding: '0 40px' }} onMouseMove={(e) => handleMouseMove(e, row)} onMouseUp={() => moveRef.current = false}>
                {renderSvg(v.relationShips)}
                <div
                  tabIndex={0}
                  onMouseDown={(e) => handleMouseDown(e, row)}
                  onMouseUp={(e) => handleMouseUp(e, row)}
                >
                  {Array.from({ length }).map((n, col) => {
                    const index = v.keys.findIndex((item) => col <= item.e && col >= item.s);

                    const style: React.CSSProperties = {};
                    let selected = '';
                    if (index > -1) {
                      style.background = '#29e';
                      style.color = '#fff';
                      style.cursor = 'pointer';
                      selected = 'true';
                    }
                    return <span data-selected={selected} data-index={index} key={`${row}_${col}`} style={{ ...style }}>{v.text.charAt(col)}</span>;
                  })}
                </div>
              </div>
            )
          })
        }
      </div>
      <div
        onMouseEnter={() => handleEdgeEnter('1')}
        onMouseLeave={() => handleEdgeLeave()}
        style={{ position: 'absolute', top: 0, right: 0, width: 40, height: '100%', zIndex: 1 }}
      />
    </div>
  );
};

export default TextMark;