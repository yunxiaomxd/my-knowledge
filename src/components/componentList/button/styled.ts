import styled from "styled-components";
import { buttonMiddleHeight, buttonMiddleSize, buttonMiddleSpaceX, buttonMiddleSpaceY } from "../../standard/size";

export const ButtonContainer = styled.button`
  outline: none !important;
  border: none !important;
  background-color: var(--button-bg);
  color: var(--button-text-color);

  font-size: ${buttonMiddleSize}px;
  height: ${buttonMiddleHeight}px;
  padding: ${buttonMiddleSpaceY}px ${buttonMiddleSpaceX}px;
  box-sizing: border-box;
`;