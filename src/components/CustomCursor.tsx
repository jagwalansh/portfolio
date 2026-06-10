import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [hideRing, setHideRing] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      setHasMoved(true);
      mx = e.clientX;
      my = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }

      const t = e.target as HTMLElement | null;
      const interactive = t?.closest("[data-cursor], a, button, input, textarea, label, [role='button']") as HTMLElement | null;

      if (interactive) {
        const shouldHideRing = 
          interactive.getAttribute("data-cursor-hide-ring") === "true" ||
          interactive.closest("[data-cursor-hide-ring='true']") !== null ||
          interactive.closest(".pointer-cat-container") !== null ||
          interactive.classList.contains("pointer-cat");

        if (shouldHideRing) {
          setHover(false);
          setHideRing(true);
          setLabel(null);
        } else {
          setHover(true);
          setHideRing(false);
          setLabel(interactive.getAttribute("data-cursor"));
        }
      } else {
        setHover(false);
        setHideRing(false);
        setLabel(null);
      }
    };

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }

      raf = requestAnimationFrame(loop);
    };

    loop();
    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className={`pointer-events-none fixed left-0 top-0 z-[100] hidden h-1.5 w-1.5 rounded-full bg-ink-deep transition-opacity duration-300 md:block ${
          hasMoved ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={ringRef}
        aria-hidden
        className={`pointer-events-none fixed left-0 top-0 z-[100] hidden items-center justify-center rounded-full border border-ink-deep/60 transition-[width,height,background-color,color,opacity] duration-300 ease-out md:flex ${
          !hasMoved ? "opacity-0" : hideRing ? "opacity-0" : "opacity-100"
        } ${
          hideRing ? "h-0 w-0" : hover ? "h-16 w-16 bg-ink-deep text-paper" : "h-8 w-8 bg-transparent text-transparent"
        }`}
      >
        {label && (
          <span className="font-sans text-[10px] uppercase tracking-[0.2em]">{label}</span>
        )}
      </div>
    </>
  );
}
