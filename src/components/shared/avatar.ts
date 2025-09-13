import { html } from "htm/preact";
import type { VNode } from "preact";
import { cx, tw } from "../twind.ts";

export type AvatarProps = {
  alt: string;
  image: string;
  size: AvatarSize;
};

export enum AvatarSize {
  xs = "w-6 h-6",
  sm = "w-8 h-8",
  md = "w-10 h-10",
  lg = "w-12 h-12",
  xl = "w-14 h-14",
}

const defaultClasses: string =
  "inline-block rounded-full outline -outline-offset-1 outline-black/5 dark:outline-white/10";

export function Avatar(props: AvatarProps): VNode {
  return html`
    <img alt="${props.alt}" src="${props.image}" class="${tw(cx(defaultClasses, props.size))}" />
  `;
}
