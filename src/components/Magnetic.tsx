import { useRef, type ReactNode } from "react";

export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  const hasDisplayClass = className && /\b(flex|grid|block|inline|absolute|fixed)\b/.test(className);
  const displayClass = hasDisplayClass ? "" : "inline-block";

  return (
    <span
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`${displayClass} ${className ?? ""}`.trim()}
    >
      <span
        ref={ref}
        className="inline-block w-full h-full transition-transform duration-300 ease-out will-change-transform"
      >
        {children}
      </span>
    </span>
  );
}
