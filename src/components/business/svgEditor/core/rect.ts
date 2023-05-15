import React, { ReactElement, ReactSVGElement, useEffect, useState } from "react";

export default function Rect(props: any) {
  const [svg, setSvg] = useState<ReactSVGElement | null>(null);
  
  useEffect(() => {
    const element = React.createElement('rect', {
      width: 300,
      height: 100,
      style: { fill: 'transparent', stroke: 'rgb(0, 0, 0)', strokeWidth: 1, },
      children: props.children,
    });

    setSvg(element);
  }, []);

  return svg as ReactElement;
}