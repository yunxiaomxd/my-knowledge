import { IMenuItem } from '../componentList';
import { Geometry } from './geometry';
import { Theme } from './theme';

export * from './theme';

export const BusinessList: IMenuItem = {
  label: '业务',
  value: 'business',
  children: [{
    label: '主题切换',
    value: 'theme',
    component: Theme
  }, {
    label: '几何绘制 - webgl',
    value: 'geometry',
    component: Geometry,
  }]
}