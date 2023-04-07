import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styles from './styles.module.scss';

const UseClickAnyway = () => {
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const handleToggle = (visible?: boolean) => {
    if (visible !== undefined) {
      setOpen(visible);
      return;
    }
    setOpen((old) => !old);
  };

  const handleClose = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (!ref.current?.contains(target) && !triggerRef.current?.contains(target)) {
      handleToggle(false);
    }
  }, [ref, triggerRef]);

  useEffect(() => {
    if (ref) {
      ref.current?.getRootNode().addEventListener('mousedown', handleClose);
    }
    return () => {
      return ref.current?.getRootNode().removeEventListener('mousedown', handleClose);
    }
  }, [ref]);

  return (
    <div>
      <div
        ref={triggerRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
      >
        select
      </div>
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >other</div>
      {
        createPortal(
          <div ref={ref} className={styles.globalDropdown}>
            {open && 'portal'}
          </div>,
          document.body,
        )
      }
    </div>
  );
}

export default UseClickAnyway;