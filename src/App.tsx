import { memo, useEffect, useState } from "react";
import { hooksList, performanceList, BusinessList, Menu, IMenuItem } from "./components";

const list = [hooksList, performanceList, BusinessList];
const defaultKey = BusinessList.children![4].value

function App() {
  const [key, setKey] = useState(defaultKey);

  useEffect(() => {
    document.documentElement.setAttribute('theme', 'light');
  }, []);

  const render = () => {
    const queue: IMenuItem[] = [...list];
    let Component = null;

    if (!key) {
      return null;
    }

    while (queue.length > 0 || Component === null) {
      const item = queue.shift();
      if (item) {
        if (item?.children) {
          queue.push(...item.children);
        }
        if (item?.value === key) {
          Component = item.component;
        }
      }
    }
    return <Component />;
  }

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      <Menu
        data={[
          hooksList,
          performanceList,
          BusinessList,
        ]}
        expand
        mode="ghost"
        onClick={(item) => setKey(item.value)}
        activeKey={key}
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {render()}
      </div>
    </div>
  );
}

export default memo(App);
