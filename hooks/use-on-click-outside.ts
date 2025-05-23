import { RefObject, useEffect } from "react";

type Event = MouseEvent | TouchEvent;

/**
 * Hook that detects clicks outside of the specified element
 * @param ref - Ref object for the element to detect clicks outside of
 * @param handler - Callback function to run when a click outside is detected
 */
export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: Event) => void
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current;
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains((event.target as Node) || null)) {
        return;
      }

      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
    // Reload only if ref or handler changes
  }, [ref, handler]);
};
