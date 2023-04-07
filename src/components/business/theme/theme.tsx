const Theme = () => {
  const handleClick = (type: 'dark' | 'light') => {
    document.documentElement.setAttribute('theme', type)
  }

  return (
    <div>
      <button onClick={() => handleClick('light')}>light</button>
      <button onClick={() => handleClick('dark')}>dark</button>
    </div>
  )
}

export default Theme;