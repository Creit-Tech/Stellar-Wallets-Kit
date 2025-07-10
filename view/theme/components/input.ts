import { Directive, input, InputSignal } from '@angular/core';
import { NgpInput } from 'ng-primitives/input';

export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Directive({
  selector: 'input[app-input]',
  hostDirectives: [{ directive: NgpInput }],
  host: {
    '[class.text-xs]': 'size() === "xs"',
    '[class.text-sm]': 'size() === "sm"',
    '[class.text-lg]': 'size() === "lg"',
    '[class.text-xl]': 'size() === "xl"',
    class: 'outline-none border-1 border-(--swk-border) rounded-(--swk-border-radius) text-(--swk-text-primary) px-2 py-1'
  },
})
export class Input {
  size: InputSignal<InputSize> = input<InputSize>('md');
}
