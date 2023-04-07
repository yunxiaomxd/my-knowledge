import React, { ReactElement, ReactNode } from "react";

/**
 * 容器组件内部接受的参数
 */
export interface IMenuContainerStyledProps {
  width?: number;
}

/**
 * 菜单组件内部接受的参数
 */
export interface IMenuItemStyledProps {
  level: number;
}

/**
 * 菜单暴露参数
 */
export interface IMenu extends IMenuContainerStyledProps {
  data: IMenuItem[];
  mode?: 'normal' | 'ghost';
  expand?: boolean;
  onClick?: (item: IMenuItem) => void;
}

export interface IMenuItem {
  label: string | ReactNode;
  value: string;
  hidden?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  children?: IMenuItem[];
  onClick?: (data: IMenuItem) => void;
  render?: (item: IMenuItem) => JSX.Element | ReactNode | ReactElement;
  [propsname: string]: any;
}