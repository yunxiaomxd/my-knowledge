import { IMenuItem } from '../componentList';
import { UseClickAnyway } from './useClickAnyway';
import { UseInterval } from './useInterval';

export const hooksList: IMenuItem = {
  label: 'hooks',
  value: 'hooks',
  children: [{
    label: 'useClickAnyway',
    value: 'useClickAnyway',
    component: UseClickAnyway,
  }, {
    label: 'useInterval',
    value: 'useInterval',
    component: UseInterval,
  }]
};

export * from './useClickAnyway';
export * from './useInterval';
