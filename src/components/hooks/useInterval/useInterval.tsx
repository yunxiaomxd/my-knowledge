import { useCallback, useEffect, useState } from "react";
import useInterval from "./hooks";

const useIntervalPage = () => {
  const { setFn, start, clear, resetDelay } = useInterval();
  const [ids, setIds] = useState<number>(0);

  const handleLoadList = useCallback(() => {
    console.log('执行轮询', ids);
  }, [ids]);

  const change = () => {
    setIds((old) => old += 1000);
  }

  const changeDelay = () => {
    resetDelay(200);
  }

  useEffect(() => {
    setFn(handleLoadList, ids > 0);
  }, [ids]);

  return (
    <div>
      <button onClick={start}>启动</button>
      <button onClick={clear}>停止</button>
      <button onClick={change}>修改数字</button>
      <button onClick={changeDelay}>修改delay</button>
    </div>
  )
}

export default useIntervalPage;