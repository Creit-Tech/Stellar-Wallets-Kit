import { Component, input, InputSignal } from '@angular/core';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from 'ng-primitives/avatar';

/**
 * The size of the avatar.
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-avatar',
  hostDirectives: [NgpAvatar],
  imports: [NgpAvatarImage, NgpAvatarFallback],
  template: `
    @if (image()) {
      <img [src]="image()" ngpAvatarImage [alt]="alt()" />
    }
    <span ngpAvatarFallback>{{ fallback() }}</span>
  `,
  host: {
    '[attr.data-size]': 'size()',
  },
  styles: `
    :host {
      position: relative;
      display: inline-flex;
      width: 3rem;
      height: 3rem;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border: var(--swk-avatar-border);
      background-color: var(--swk-avatar-background);
      vertical-align: middle;
      overflow: hidden;
    }

    :host[data-size='xs'] {
      width: 1.5rem;
      height: 1.5rem;
    }

    :host[data-size='sm'] {
      width: 2rem;
      height: 2rem;
    }

    :host[data-size='md'],
    :host:not([data-size]) {
      width: 2.5rem;
      height: 2.5rem;
    }

    :host[data-size='lg'] {
      width: 3rem;
      height: 3rem;
    }

    :host[data-size='xl'] {
      width: 3.5rem;
      height: 3.5rem;
    }

    :host:before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 9999px;
    }

    [ngpAvatarImage] {
      width: 100%;
      height: 100%;
    }

    [ngpAvatarFallback] {
      text-align: center;
      font-weight: 500;
      color: var(--swk-avatar-fallback);
    }
  `,
})
export class Avatar {
  readonly size: InputSignal<AvatarSize> = input<AvatarSize>('md');
  readonly image: InputSignal<string | undefined> = input<string>();
  readonly alt: InputSignal<string> = input<string>('Image');
  readonly fallback: InputSignal<string | undefined> = input<string>();
}
