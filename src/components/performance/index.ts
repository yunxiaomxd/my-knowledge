import { IMenuItem } from '../componentList';
import { CanvasPerformance } from './canvasPerformance';
import { TimePerformance } from './timePerformance';

export const performanceList: IMenuItem = {
  label: '性能',
  value: 'performance',
  children: [{
    label: '时间切片',
    value: 'timePerformance',
    component: TimePerformance
  }, {
    label: 'canvas 性能优化',
    value: 'canvasPerformance',
    component: CanvasPerformance
  }]
};

export * from './canvasPerformance';
export * from './timePerformance';
