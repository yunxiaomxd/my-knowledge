/**
 * 超出显示省略号
 */
export const ellipsis = `
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/**
 * flex 布局
 */
export const flex = `
  display: flex;
`;

/**
 * 垂直居中
 */
export const verticalCenter = `
  ${flex}
  align-items: center;
`;

/**
 * 水平居中
 */
export const horizontalCenter = `
  ${flex}
  justify-content: center;
`;

/**
 * 水平垂直居中
 */
export const center = `
  ${horizontalCenter}
  align-items: center;
`;