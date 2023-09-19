import styled from 'styled-components';
import { menuSpace, menuItemMiddleHeight, menuFontSize } from '../../standard/size';
import * as rule from '../../standard/rule';
import { IMenuContainerStyledProps, IMenuItemStyledProps } from './interface';

export const Container = styled.div<IMenuContainerStyledProps>`
  height: 100%;
  background: #fff;
  position: relative;
  transition: width .3s;
`;

export const ContainerGhost = styled.div`
  position: fixed;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 101;
`;

export const ContainerSlide = styled.div`
  width: 64px;
  height: 100%;
  position: relative;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.8);
`;

export const MenuExpand = styled.div`
  position: absolute;
  width: 32px;
  height: 32px;
  top: 32px;
  right: -32px;
  border-top-right-radius: 50%;
  border-bottom-right-radius: 50%;
  background: #29e;
  color: #fff;
  cursor: pointer;
  ${rule.center}
`;

export const MenuGroup = styled.div``;

export const MenuGroupContent = styled.div<Omit<IMenuItemStyledProps, 'selected'>>`
  height: ${menuItemMiddleHeight}px;
  padding-left: ${(props) => (props.level || 1) * menuSpace}px;
  ${rule.verticalCenter}
  
  span {
    display: block;
    flex: 1;
    ${rule.ellipsis}
  }
`;

export const MenuItem = styled.div<IMenuItemStyledProps>`
  height: ${menuItemMiddleHeight}px;
  font-size: ${menuFontSize}px;
  padding-left: ${(props) => (props.level || 1) * menuSpace}px;
  color: var(--menu-item-text-color);
  background-color: var(--menu-item-bg);
  transition: all .3s;
  cursor: pointer;
  ${rule.verticalCenter}

  ${(props) => props.selected ? `
    background-color: var(--menu-item-selected-bg);
    color: var(--menu-item-text-hover-color);
  ` : `
    &:hover {
      background-color: var(--menu-item-hover-bg);
    }
  `}
  
  span {
    display: block;
    flex: 1;
    ${rule.ellipsis}
  }
`;