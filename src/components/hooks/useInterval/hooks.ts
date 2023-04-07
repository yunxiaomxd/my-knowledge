import { useCallback, useRef } from "react";

const useInterval = () => {
  const fnRef = useRef();
  const timerRef = useRef<NodeJS.Timeout>();
  const delayRef = useRef<number>(1000);

  const setReStart = (value: boolean) => {
    if (value) {
      clear();
      start();
    }
  }

  /**
   * 设置 interval 执行函数
   * @param fn 执行函数
   * @param restart 重新启动定时器
   */
  const setFn = (fn: any, restart = false) => {
    fnRef.current = fn;
    setReStart(restart);
  }

  const resetDelay = (newDelay: number, restart = true) => {
    delayRef.current = newDelay;
    setReStart(restart);
  }

  const start = useCallback(() => {
    if (!fnRef.current || delayRef.current === undefined) {
      clear();
      return;
    }
    clear();
    timerRef.current = setInterval(fnRef.current, delayRef.current);
  }, [fnRef.current, timerRef.current, delayRef.current]);

  const clear = () => {
    clearInterval(timerRef.current);
  }

  return { setFn, start, clear, resetDelay };
}

export default useInterval;