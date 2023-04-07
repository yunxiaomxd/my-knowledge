import { useEffect, useRef } from "react";

const TimePerformance = () => {
  const ref = useRef<HTMLDivElement>(null);

  const spliceTime = () => {
    const max = 50000;
    // for (let i = 0; i < max; i++) {
    //   const div = document.createElement('div');
    //   div.innerHTML = 'div';
    //   div.style.backgroundColor = '#f00';
    //   ref.current?.appendChild(div);
    // }

    let count = 0;
    const render = () => {
      requestAnimationFrame(() => {
        for (let i = 0; i < 200; i++) {
          const div = document.createElement('div');
          div.innerHTML = 'div';
          div.style.backgroundColor = '#f00';
          ref.current?.appendChild(div);
        }
        if (count < max) {
          render();
          count += 500;
        } else {
          console.log('complete');
        }
      });
    };
    render();
    // const s2 = Date.now();
    // for (let i = 0; i < max; i++) {
    //   const div = document.createElement('div');
    //   div.innerHTML = 'div';
    //   div.style.backgroundColor = '#f00';
    //   ref.current?.appendChild(div);
    // }
    // console.log(`during: ${Date.now() - s2}`);
  }

  useEffect(() => {
    if (ref.current) {
      spliceTime();
    }
  }, [ref]);

  return (
    <div>
      performance
      <div ref={ref}></div>
    </div>
  )
}

export default TimePerformance;