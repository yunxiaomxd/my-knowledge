import React from "react"
import { IButton } from "./interface"
import { ButtonContainer } from "./styled";

const Button: React.FC<IButton> = (props) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick && props.onClick(e);
  }

  return (
    <ButtonContainer onClick={handleClick}>
      {props.children}
    </ButtonContainer>
  );
}

export default Button;