/**
 * useResizer.ts
 *
 * Generic drag-to-resize hook for panels.
 * Replaces the duplicated onMouseDown resize logic in AppShell.tsx
 * (used for both the sidebar and the split editor divider).
 */
import { useCallback } from 'react';

interface ResizerOptions {
  /** Current size value (width or ratio) */
  value: number;
  /** Callback to update the size */
  onChange: (newValue: number) => void;
  /** Minimum allowed value */
  min: number;
  /** Maximum allowed value */
  max: number;
  /**
   * If 'ratio', the delta is computed as a percentage of parentWidth.
   * If 'pixels' (default), the delta is in raw pixels.
   */
  mode?: 'pixels' | 'ratio';
}

export function useResizer({ value, onChange, min, max, mode = 'pixels' }: ResizerOptions) {
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startValue = value;
      const parentWidth =
        mode === 'ratio'
          ? (e.currentTarget as HTMLElement).parentElement?.clientWidth ?? window.innerWidth
          : 1;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        const newValue =
          mode === 'ratio'
            ? Math.min(max, Math.max(min, startValue + (delta / parentWidth) * 100))
            : Math.min(max, Math.max(min, startValue + delta));
        onChange(newValue);
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [value, onChange, min, max, mode],
  );

  return { onMouseDown };
}
