import { Component, input, InputSignal, InputSignalWithTransform } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

/**
 * The size of the button.
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'button[app-button]',
  hostDirectives: [{ directive: NgpButton, inputs: ['disabled'] }],
  template: '<ng-content />',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-ghost]': 'ghost()',
  },
  styles: `
    :host {
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.5rem 1rem;
      border-radius: var(--swk-border-radius);
      color: var(--swk-text-primary);
      border: none;
      font-weight: 500;
      background-color: var(--swk-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--swk-button-shadow);
      box-sizing: border-box;
    }

    :host[data-hover] {
      background-color: var(--swk-background-hover);
    }

    :host[data-focus-visible] {
      outline: 2px solid var(--swk-focus-ring);
    }

    :host[data-press] {
      background-color: var(--swk-background-active);
    }

    :host[data-size='xs'] {
      height: 1.5rem;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      font-size: 0.875rem;
    }

    :host[data-size='sm'] {
      height: 2rem;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      font-size: 0.875rem;
    }

    :host[data-size='md'],
    :host:not([data-size]) {
      height: 2.5rem;
      padding-left: 1rem;
      padding-right: 1rem;
      font-size: 0.875rem;
    }

    :host[data-size='lg'] {
      height: 3rem;
      padding-left: 1.25rem;
      padding-right: 1.25rem;
      font-size: 1rem;
    }

    :host[data-size='xl'] {
      height: 3.5rem;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
      font-size: 1.125rem;
    }
    
    :host[data-ghost='yes'], :host[data-ghost='true'] {
        border: none;
        box-shadow: none;
        height: min-content !important;
    }
  `,
})
export class Button {
  readonly size: InputSignal<ButtonSize> = input<ButtonSize>('md');
  readonly ghost: InputSignalWithTransform<boolean, boolean | string> = input(false, {
    transform: (v: boolean | string): boolean => {
      return typeof v === 'string' ? v.toLowerCase() === 'true' || v.toLowerCase() === 'yes' : v;
    },
  });
}
