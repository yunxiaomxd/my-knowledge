const text = `
我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁
我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁
我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁
我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁我是谁
`;

const TextMark = () => {
  const textLine = text.split('\n').map((v) => {
    return {
      text: v,
      id: Math.random(),
      keys: [],
      relationships: [],
    };
  });
  return (
    textLine.map((v) => {
      const length = v.text.length;
      return (
        <div key={v.id}>
          <div>
            {Array.from({ length }).map((n, i) => {
              return v.text.charAt(i);
            })}
          </div>
        </div>
      )
    })
  );
};

export default TextMark;