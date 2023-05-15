import { RightOutlined } from "@ant-design/icons";
import { CSSProperties, useCallback, useState } from "react";
import { menuWidth } from "../../standard/size";
import { MenuMode } from "./contants";
import { IMenu, IMenuItem } from "./interface";
import { Container, ContainerGhost, ContainerSlide, MenuExpand, MenuGroup, MenuGroupContent, MenuItem } from "./styled";

const Menu = (props: IMenu) => {
  const { data, mode = MenuMode.Normal, expand = false } = props;
  const [open, setOpen] = useState(true);
  const [ghostOpen, setGhostOpen] = useState(false);
  
  const handleItemClick = (item: IMenuItem) => {
    if (item.disabled) {
      return;
    }
    
    if (item.onClick) {
      item.onClick(item);
      return;
    }
    
    if (props.onClick) {
      props.onClick(item);
    }

    setOpen(true);
  }

  const handleToggle = useCallback(() => {
    if (mode === MenuMode.Normal) {
      setOpen(!open);
      return;
    }
    setOpen(!open);
    setGhostOpen(false);
  }, [mode, open]);

  const render = (menu: IMenuItem[], index = 1) => {
    return menu.map((v) => {
      if (v.hidden) {
        return null;
      }
      if (v.children) {
        return (
          <MenuGroup key={v.value}>
            <MenuGroupContent level={index} >
              <span>{v.label}</span>
            </MenuGroupContent>
            {render(v.children, index + 1)}
          </MenuGroup>
        );
      }
      return (
        <MenuItem
          onClick={() => handleItemClick(v)}
          key={v.value}
          level={index}
        >
          <span>{v.label}</span>
        </MenuItem>
      );
    })
  }

  const renderExpand = () => {
    if (!expand) {
      return null;
    }
    const deg = open ? 180 : 0;
    return (
      <MenuExpand onClick={handleToggle}>
        <RightOutlined style={{ transform: `rotateY(${deg}deg)`, transformOrigin: 'center', transition: 'transform .3s' }} />
      </MenuExpand>
    );
  }

  const element = (
    <>
      {expand && renderExpand()}
      {render(data)}
    </>
  );

  if (mode === MenuMode.Ghost) {
    /**
     * 关闭时，进入幽灵模式
     */
    if (!open) {
      const ghostStyle: CSSProperties = {};

      if (!ghostOpen) {
        ghostStyle.overflow = 'hidden';
      }

      return (
        <ContainerGhost>
          <ContainerSlide onMouseEnter={() => setGhostOpen(true)} />
          <Container
            style={{
              width: ghostOpen ? menuWidth : 0,
              position: 'absolute',
              zIndex: 2,
              top: 0,
              left: 0,
              ...ghostStyle,
            }}
            onMouseLeave={() => setGhostOpen(false)}
          >
            {expand && renderExpand()}
            {element}
          </Container>
        </ContainerGhost>
      )
    }

    return (
      <Container style={{ width: menuWidth }}>
        {expand && renderExpand()}
        {element}
      </Container>
    )
  }

  return (
    <Container style={{ width: open ? menuWidth : 64 }}>
      {element}
    </Container>
  );
}

export default Menu;