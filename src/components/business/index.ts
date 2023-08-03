import { IMenuItem } from '../componentList';
import { Geometry, GeometryPBR } from './geometry';
import { Theme } from './theme';
import { X6V } from './antChart';
import { SvgEditor } from './svgEditor';
import { TextMark } from './textMark';

export * from './theme';

export const BusinessList: IMenuItem = {
  label: '业务',
  value: 'business',
  children: [{
    label: '主题切换',
    value: 'theme',
    component: Theme
  }, {
    label: '文本标注',
    value: 'textMark',
    component: TextMark,
  }, {
    label: 'geometry(webgl) - blinn-phong',
    value: 'geometry',
    component: Geometry,
  }, {
    label: 'geometry(webgl) - pbr',
    value: 'pbr',
    component: GeometryPBR,
  }, {
    label: 'svg',
    value: 'svg',
    children: [{
      label: 'antv-x6',
      value: 'antv-x6',
      component: X6V,
    }, {
      label: 'editor',
      value: 'editor',
      component: SvgEditor,
    }]
  }]
}