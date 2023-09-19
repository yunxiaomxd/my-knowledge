import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

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
  id: string;
  originKey: string;
  targetKey: string;
}

interface ITextKeyItem {
  s: number;
  e: number;
  text: string;
  type?: string;
  id: string;
}

interface ITextItem {
  text: string;
  id: string;
  keys: ITextKeyItem[];
  relationShips: ITextRelationShipItem[];
}

const perHeight = 50;
const padding = 40;

const TextMark = () => {
  const stopPropagationRef = useRef<Boolean>();
  const moveRef = useRef<Boolean>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number>(0);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [keyCount, setKeyCount] = useState(0);
  const [textLine, setTextLine] = useState<ITextItem[]>(text.split('\n').map((v) => {
    return {
      text: v,
      id: Math.random().toString(),
      keys: [],
      relationShips: [],
    };
  }));
  const selectionRef = useRef<any>();

  const handleMouseStartDraw = (e: React.MouseEvent<HTMLDivElement | HTMLSpanElement>, row: number) => {
    const ele = e.target as HTMLSpanElement;
    const currentKey = ele.getAttribute('data-key');

    if (e.button === 2) {
      return;
    }
    
    // 点击前查看是否已存在选中，已选中的不允许操作
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      selection.empty();
      return;
    }

    if (currentKey) {
      const textItem = textLine[row];

      const parentElement = ele.parentElement as HTMLDivElement;

      const nodeStart = parentElement.offsetLeft;
      const nodeEnd = parentElement.offsetLeft + parentElement.offsetWidth;

      let level = 1;
      const list = textItem.relationShips.filter((v) => v.originKey === currentKey || v.targetKey === currentKey).sort((a, b) => b.level - a.level);

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
                  id: Math.random().toString(),
                  originKey: currentKey,
                  targetKey: '',
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

  /**
   * 停止绘制
   */
  const handleMouseEndDraw = (e: React.MouseEvent<HTMLSpanElement>, row: number) => {
    stopPropagationRef.current = true;

    if (moveRef.current) {
      const target = e.target as HTMLSpanElement;
      const targetKey = target.getAttribute('data-key');

      setTextLine((list) => {
        return list.map((item, i) => {
          if (i === row) {
            return {
              ...item,
              relationShips: targetKey ?
                item.relationShips.map((ship, index) => {
                  return index === item.relationShips.length - 1 ? { ...ship, targetKey } : ship;
                })
                : item.relationShips.filter((ships, index, arr) => index !== arr.length - 1)
            }
          }
          return item;
        });
      });
      moveRef.current = false;
      return;
    }

    const selection = window.getSelection();
    const text = selection?.toString();
    const start = selectionRef.current;
    const end = selection!.focusNode?.parentElement;

    if (selection && text && start && start.element && end && start.row === row) {
      const startEqual = selection!.anchorNode?.parentElement === start.element;
      const container = end.parentElement!;
      const nodes = Array.from(container.childNodes);
      let startIndex = nodes.indexOf(startEqual ? start.element : selection!.anchorNode?.parentElement);
      let endIndex = nodes.indexOf(end);

      if (startIndex > endIndex) {
        const tempIndex = startIndex;
        startIndex = endIndex;
        endIndex = tempIndex;
      }

      const textLineItem = textLine[row];
      const { keys } = textLineItem;

      const index = keys.findIndex((v) => {
        return (startIndex >= v.s && startIndex <= v.e) || (endIndex >= v.s && endIndex <= v.e);
      });

      if (index > -1) {
        selection?.empty();
        return;
      }

      const newTextLine = textLine.map((item, index) => {
        if (row === index) {
          const res = { ...item, keys: [...item.keys, { s: startIndex, e: endIndex, text: '实体名称', id: Math.random().toString() }] };
          return res;
        }
        return item;
      });

      setTextLine(newTextLine);
    }

    selectionRef.current = null;
  }

  /**
   * 中间空白区域停止绘制 
   */
  const handleMouseEndDrawInSpace = (e: React.MouseEvent<HTMLDivElement>, row: number) => {
    moveRef.current = false;
    if (stopPropagationRef.current) {
      stopPropagationRef.current = false;
      return;
    }

    setTextLine((list) => {
      return list.map((item, i) => {
        if (i === row) {
          return {
            ...item,
            relationShips: item.relationShips.filter((ships, index, arr) => index !== arr.length - 1)
          }
        }
        return item;
      });
    });
  }

  /**
   * 绘制
   */
  const handleMouseDraw = (e: React.MouseEvent<HTMLDivElement>, row: number) => {
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
                return { ...ship, e: { x: e.clientX - boundingRect.x + target.scrollLeft - padding, y: perHeight * ship.level } }
              }
              return ship;
            })
          }
        }
        return item;
      });
    });
  }

  /**
   * 边缘动画
   */
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
    if (!moveRef.current) {
      return;
    }
    edgeAnimation(type);
  }

  const handleEdgeLeave = () => {
    cancelAnimationFrame(timerRef.current);
  }

  useEffect(() => {
    containerRef.current && setScrollWidth(containerRef.current.scrollWidth);
  }, [containerRef.current]);

  useLayoutEffect(() => {
    setKeyCount((count) => count += 1);
  }, []);

  /**
   * 渲染实体关系的 svg
   */
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
                    style={{ width: '100%', height: '100%', background:'#00c4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
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

  /**
   * 渲染实体
   */
  const renderKey = (list: ITextKeyItem[], row: number) => {
    if (!containerRef.current) {
      return null;
    }

    const children = Array.from(containerRef.current.childNodes);
    const currentChild = children[row] as HTMLDivElement;
    if (!currentChild) {
      return null;
    }

    const spanList = Array.from(currentChild.querySelector('.text-container')!.querySelectorAll('span'));
    return (
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: 28 }}>
        {
          list.map((v) => {
            const startSpan = spanList[v.s];
            const endSpan = spanList[v.e];

            const startX = startSpan.offsetLeft - padding;
            const endX = endSpan.offsetLeft + endSpan.offsetWidth - padding;

            const width = endX - startX;

            return (
              <div key={v.id} style={{ width, position: 'absolute', left: startX, textAlign: 'center' }}>
                <span
                  onMouseDown={(e) => handleMouseStartDraw(e, row)}
                  onMouseUp={(e) => handleMouseEndDraw(e, row)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  data-key={v.id}
                >{v.text}</span>
              </div>
            )
          })
        }
      </div>
    )
  }

  return (
    <div style={{ boxSizing: 'border-box', width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <div
        onMouseEnter={() => handleEdgeEnter('2')}
        onMouseLeave={() => handleEdgeLeave()}
        style={{ position: 'absolute', top: 0, left: 0, width: 40, height: '100%', zIndex: 1 }}
      />
      <div
        ref={containerRef}
        style={{ padding: `${padding}px 0`, boxSizing: 'border-box', overflow: 'auto', whiteSpace: 'nowrap', width: '100%', height: '100%', position: 'relative' }}
      >
        {
          textLine.map((v, row) => {
            const length = v.text.length;
            return (
              <div
                key={v.id}
                style={{ lineHeight: 1, width: 'max-content', padding: `0 ${padding}px` }}
                onMouseMove={(e) => handleMouseDraw(e, row)}
                onMouseUp={(e) => handleMouseEndDrawInSpace(e, row)}
              >
                {renderSvg(v.relationShips)}
                {keyCount > 0 && renderKey(v.keys, row)}
                <div
                  tabIndex={0}
                  onMouseDown={(e) => handleMouseStartDraw(e, row)}
                  onMouseUp={(e) => handleMouseEndDraw(e, row)}
                  className="text-container"
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