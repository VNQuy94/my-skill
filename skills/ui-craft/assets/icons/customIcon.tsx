// Helper for the product's own icons. Draw on the 24×24 grid (see icon-grid.svg):
// stay inside 1–23, keep ≥ 2px between separate strokes, use <path>/<circle>/<line> only,
// no fills, no colors, no transforms. Stroke width and caps come from <Icon>.
import type { ReactNode, SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & { size?: number };

export function customIcon(name: string, children: ReactNode) {
  const C = ({ size = 24, strokeWidth = 2, ...rest }: Props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      data-icon={name}
      {...rest}
    >
      {children}
    </svg>
  );
  C.displayName = `Icon(${name})`;
  C.custom = true;
  return C;
}
