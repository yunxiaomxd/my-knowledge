import { ReactElement, ReactSVGElement } from "react";

interface ISvgContainer {
  children: ReactElement;
}

export default function Cointainer(props: ISvgContainer) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      {props.children}
    </svg>
  )
}