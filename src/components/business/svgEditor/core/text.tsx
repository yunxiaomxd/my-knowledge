import React, { ReactElement, ReactSVGElement, useEffect, useState } from "react";

export default function Text(props: any) {
  const [svg, setSvg] = useState<ReactSVGElement | null>(null);
  
  useEffect(() => {
    const element = React.createElement('text', {
      x: 0,
      y: 16,
      fill: '#f00',
      width: 100,
      height: 34,
      children: props.children,
    });

    setSvg(element);
  }, []);

  return svg as ReactElement;
}