import React, { useRef, useState } from "react";

const text = `我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁是谁我
我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁
我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁
我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁`;

interface IPosition {
  x: number;
  y: number;
}

interface ITextRelationShipItem {
  s: IPosition;
  e: IPosition;
  level: number;
  text: string;
  id: string | number;
}

interface ITextItem {
  text: string;
  id: string;
  keys: { s: number; e: number }[];
  relationShips: ITextRelationShipItem[];
}

const TextMark = () => {
  const moveRef = useRef<Boolean>();
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

      const nodeStart = start.offsetLeft;
      const nodeEnd = end.offsetLeft + end.offsetWidth;

      const x = (nodeStart + nodeEnd) / 2;
      const y = 100;

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
                  level: 0,
                  text: '归类处理',
                  id: Math.random(),
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

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>, row: number) => {
    if (moveRef.current) {
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
      setTextLine((value) => {
        return value.map((item, index) => {
          if (row === index) {
            item.keys.push({ s: startIndex, e: endIndex });
            return { ...item };
          }
          return item;
        });
      });
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
                return { ...ship, e: { x: e.clientX - boundingRect.x + target.scrollLeft, y: ship.e.y } }
              }
              return ship;
            })
          }
        }
        return item;
      });
    });
  }

  const renderSvg = (list: ITextRelationShipItem[]) => {
    if (list.length === 0) {
      return null;
    }
    return (
      <div>
        {
          list.map((v) => {
            const startX = v.s.x;
            const startY = v.s.y;

            const endX = v.e.x;
            const endY = v.e.y;

            const rectLeftX = (startX + endX) / 2 - 50;
            const rectRightX = (startX + endX) / 2 + 50;
            const rectCenterY = (v.level + 1) * 25;

            const rectWidth = rectRightX - rectLeftX;
            const rectHeight = 32;
            const rectY = rectCenterY - rectHeight / 2;

            return (
              <svg key={v.id} width="100%" height="100" xmlns="http://www.w3.org/2000/svg" version="1.1">
                <line x1={startX} y1={startY} x2={rectLeftX} y2={rectCenterY} style={{ stroke: 'rgb(255,0,0)', strokeWidth: 2 }} />
                <foreignObject width={rectWidth} height={rectHeight} x={rectLeftX} y={rectY}>
                  <div
                    style={{ width: '100%', height: '100%', background:'rgba(0,0,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {v.text}
                  </div>
                </foreignObject>
                <line x1={rectRightX} y1={rectCenterY} x2={endX} y2={endY} style={{ stroke: 'rgb(255,0,0)', strokeWidth: 2 }} />
              </svg>
            )
          })
        }
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
    {
      textLine.map((v, row) => {
        const length = v.text.length;
        return (
          <div key={v.id} style={{ lineHeight: 1 }} onMouseMove={(e) => handleMouseMove(e, row)} onMouseUp={() => moveRef.current = false}>
            {renderSvg(v.relationShips)}
            <div
              tabIndex={0}
              onMouseDown={(e) => handleMouseDown(e, row)}
              onMouseUp={(e) => handleMouseUp(e, row)}
              style={{ position: 'relative' }}
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
  );
};

export default TextMark;