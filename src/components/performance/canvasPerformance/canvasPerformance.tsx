import { useEffect, useRef } from "react";

// const limit = 100 * 1;

const CanvasPerformance = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  // const offScreenRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) {
      // 优化点1：离屏幕渲染
    }
  }, [ref]);

  return (
    <div>
      <canvas width={640} height={480} ref={ref} />
    </div>
  );
}

export default CanvasPerformance;