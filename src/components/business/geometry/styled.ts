import styled from "styled-components";

export const Container = styled.div`
  padding: 10px 40px;
  box-shadow: 0 0 5px #ddd;
  height: 100%;
  box-sizing: border-box;
`;
export const Content = styled.div``;
export const Menu = styled.div`
  display: flex;
  align-items: center;
`;
export const MenuItem = styled.div`
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  background-color: rgba(34, 153, 238, .8);
  color: #fff;
  transition: all .3s;

  &:hover {
    background-color: rgba(34, 153, 238, 1);
  }
`;

export const Panel = styled.div`
  padding: 4px 6px;
  border-radius: 4px;
  box-shadow: 0 0 5px #d3d0d0;
`;

export const PanelTitle = styled.div`
  border-bottom: 1px solid #ebebeb;
  padding: 6px 0;
`;

export const PanelContent = styled.div`
  padding: 6px 0;
`;