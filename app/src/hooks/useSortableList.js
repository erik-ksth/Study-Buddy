import { useEffect, useRef } from "react";
import Sortable from "sortablejs";

// Lets SortableJS handle the drag visually; the caller reorders its own state
// in onReorder using oldIndex/newIndex, and React's keyed reconciliation takes
// it from there without fighting Sortable's direct DOM moves.
export function useSortableList(handle, onReorder) {
  const containerRef = useRef(null);
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  useEffect(() => {
    if (!containerRef.current) return;

    const sortable = new Sortable(containerRef.current, {
      animation: 150,
      handle,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      onEnd(evt) {
        if (evt.oldIndex !== evt.newIndex) {
          onReorderRef.current(evt.oldIndex, evt.newIndex);
        }
      },
    });

    return () => sortable.destroy();
  }, [handle]);

  return containerRef;
}
