import { html } from "htm/preact";
import type { VNode } from "preact";
import { cx, tw } from "../twind.ts";

export type ButtonProps = {
  styles?: string;
  classes?: string;
  size: ButtonSize;
  mode: ButtonMode;
  shape: ButtonShape;
  children: any;
  onClick: () => any;
};

export enum ButtonSize {
  xs = "xs",
  sm = "sm",
  md = "md",
  lg = "lg",
  xl = "xl",
}

export enum ButtonMode {
  primary = "primary",
  secondary = "secondary",
  ghost = "ghost",
  free = "free",
}

export enum ButtonShape {
  regular = "regular",
  icon = "icon",
}

const defaultClasses = "flex items-center justify-center font-semibold easy-in-out transition leading-none";

export function Button(
  { size = ButtonSize.md, mode = ButtonMode.primary, shape = ButtonShape.regular, classes, styles, children, onClick }:
    ButtonProps,
): VNode {
  const modeStyle: string = cx({
    "border-none bg-primary text-primary-foreground shadow-default hover:opacity-70 focus:opacity-90":
      mode === ButtonMode.primary,
    "border-none bg-background text-foreground shadow-default hover:opacity-70 focus:opacity-90":
      mode === ButtonMode.secondary,
    "bg-transparent text-foreground border-transparent border-1 hover:border-light-gray": mode === ButtonMode.ghost,
  });

  const radius: string = cx({
    "rounded-default": shape === ButtonShape.regular,
    "rounded-full": shape === ButtonShape.icon,
  });

  const sizeStyle: string = cx({
    "text-xs": size === ButtonSize.xs,
    "text-sm": size !== ButtonSize.xs,
  });

  const padding: string = cx({
    "px-2 py-1": shape === ButtonShape.regular && (size === ButtonSize.xs || size === ButtonSize.sm),
    "px-2.5 py-1.5": shape === ButtonShape.regular && size === ButtonSize.md,
    "px-3 py-2": shape === ButtonShape.regular && size === ButtonSize.lg,
    "px-3.5 py-2.5": shape === ButtonShape.regular && size === ButtonSize.xl,
    "p-1": shape === ButtonShape.icon && size === ButtonSize.xs,
    "p-1.5": shape === ButtonShape.icon && size === ButtonSize.sm,
    "p-2": shape === ButtonShape.icon && size === ButtonSize.md,
    "p-2.5": shape === ButtonShape.icon && size === ButtonSize.lg,
    "p-3": shape === ButtonShape.icon && size === ButtonSize.xl,
  });

  const theme: string = mode === ButtonMode.free ? "" : tw(cx(
    "cursor-pointer",
    defaultClasses,
    modeStyle,
    radius,
    sizeStyle,
    padding,
  ));

  return html`
    <button onClick="${() => onClick()}" type="button" style="${styles}" class="${theme} ${classes}">
      ${children}
    </button>
  `;
}
