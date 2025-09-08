import { html } from "htm/preact";
import type { VNode } from "preact";
import { cx, tw } from '../twind.ts';

export type ButtonProps = {
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
}

export enum ButtonShape {
  regular = "regular",
  icon = "icon",
}

const defaultClasses = "font-semibold easy-in-out transition leading-none";

export function Button(props: ButtonProps): VNode {
  const mode: string = cx({
    "bg-primary text-primary-foreground shadow-default": props.mode === ButtonMode.primary,
    "bg-background text-foreground shadow-default": props.mode === ButtonMode.secondary,
    "bg-transparent text-foreground border-transparent border-1 hover:border-light-gray":
      props.mode === ButtonMode.ghost,
  });

  const radius: string = cx({
    "rounded-default": props.shape === ButtonShape.regular,
    "rounded-full": props.shape === ButtonShape.icon,
  });

  const size: string = cx({
    "text-xs": props.size === ButtonSize.xs,
    "text-sm": props.size !== ButtonSize.xs,
  });

  const padding: string = cx({
    "px-2 py-1": props.shape === ButtonShape.regular && (props.size === ButtonSize.xs || props.size === ButtonSize.sm),
    "px-2.5 py-1.5": props.shape === ButtonShape.regular && props.size === ButtonSize.md,
    "px-3 py-2": props.shape === ButtonShape.regular && props.size === ButtonSize.lg,
    "px-3.5 py-2.5": props.shape === ButtonShape.regular && props.size === ButtonSize.xl,
    "p-1": props.shape === ButtonShape.icon && props.size === ButtonSize.xs,
    "p-1.5": props.shape === ButtonShape.icon && props.size === ButtonSize.sm,
    "p-2": props.shape === ButtonShape.icon && props.size === ButtonSize.md,
    "p-2.5": props.shape === ButtonShape.icon && props.size === ButtonSize.lg,
    "p-3": props.shape === ButtonShape.icon && props.size === ButtonSize.xl,
  });

  return html`
    <button onClick="${() => props.onClick()}" type="button" class="${tw(cx(
      'cursor-pointer',
      defaultClasses,
      mode,
      radius,
      size,
      padding,
    ))}">
      ${props.children}
    </button>
  `;
}
