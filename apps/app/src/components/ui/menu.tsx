"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A deliberately small dropdown.
 *
 * This replaces Radix's DropdownMenu for the header controls. That component
 * renders through a portal and positions itself with Floating UI's autoUpdate,
 * which observes the trigger, the panel and every scroll ancestor. Against our
 * sticky, backdrop-filtered header that combination wedged the renderer: a real
 * mouse click on either header menu froze the page outright — verified with
 * synthetic input at the same coordinates, where clicking empty canvas returned
 * immediately and clicking the trigger never did.
 *
 * Nothing here needs a portal or a focus trap. The panel is a plain absolutely
 * positioned element inside a relative wrapper, so there is no measurement loop
 * to get stuck in.
 */

type MenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  menuId: string;
};

const MenuContext = React.createContext<MenuContextValue | null>(null);

function useMenu() {
  const ctx = React.useContext(MenuContext);
  if (!ctx) throw new Error("Menu parts must be used inside <Menu>");
  return ctx;
}

export function Menu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const menuId = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);

  // Close on a pointer press anywhere outside, and on Escape.
  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <MenuContext.Provider value={{ open, setOpen, menuId }}>
      <div ref={rootRef} className={cn("relative", className)}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

export const MenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, onClick, ...props }, ref) => {
  const { open, setOpen, menuId } = useMenu();
  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      data-state={open ? "open" : "closed"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      }}
      className={className}
      {...props}
    />
  );
});
MenuTrigger.displayName = "MenuTrigger";

export function MenuContent({
  className,
  align = "end",
  children,
}: {
  className?: string;
  align?: "start" | "end";
  children: React.ReactNode;
}) {
  const { open, menuId } = useMenu();
  if (!open) return null;

  return (
    <div
      id={menuId}
      role="menu"
      className={cn(
        "absolute top-[calc(100%+6px)] z-[60] min-w-[10rem] overflow-hidden rounded-lg border border-border bg-surface p-1 text-foreground shadow-pop",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MenuLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "px-2.5 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-subtle-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MenuItem({
  className,
  onSelect,
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "onSelect"> & {
  onSelect?: () => void;
}) {
  const { setOpen } = useMenu();
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        // Close first, so a selection that re-renders the page cannot leave
        // this menu mounted mid-teardown.
        setOpen(false);
        onSelect?.();
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2 rounded px-2.5 py-1.5 text-left text-[13px] outline-none",
        "hover:bg-muted focus-visible:bg-muted",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
