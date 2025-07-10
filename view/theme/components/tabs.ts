import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChildren, model, ModelSignal, Signal } from '@angular/core';
import { NgpTabButton, NgpTabList, NgpTabPanel, NgpTabset } from 'ng-primitives/tabs';
import { Tab } from './tab';

@Component({
  selector: 'app-tabs',
  imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel, NgTemplateOutlet],
  template: `
    <div [(ngpTabsetValue)]="value" ngpTabset class="w-full">
      <div ngpTabList>
        @for (tab of tabs(); track tab.label()) {
          <button class="text-(--swk-text-primary) cursor-pointer"
                  [ngpTabButtonValue]="tab.value()"
                  ngpTabButton>
            {{ tab.label() }}
          </button>
        }
      </div>

      @for (tab of tabs(); track tab.label()) {
        <div [ngpTabPanelValue]="tab.value()" ngpTabPanel>
          <ng-container [ngTemplateOutlet]="tab.content()" />
        </div>
      }
    </div>
  `,
  styles: `
    [ngpTabList] {
      display: flex;
      gap: 1.5rem;
      border-bottom: 1px solid var(--swk-border);
    }

    [ngpTabButton] {
      border: none;
      background-color: transparent;
      margin-bottom: -1px;
      border-bottom: 2px solid transparent;
      padding: 0.5rem 0;
      outline: none;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpTabButton][data-focus-visible] {
      outline: 2px solid var(--swk-focus-ring);
      outline-offset: 2px;
    }

    [ngpTabButton][data-active] {
      border-color: var(--swk-background-inverse);
      color: var(--swk-text-primary);
    }

    [ngpTabPanel] {
      padding: 0.5rem 0;
      outline: none;
    }

    [ngpTabPanel]:not([data-active]) {
      display: none;
    }
  `,
})
export class Tabs {
  readonly value: ModelSignal<string | undefined> = model<string | undefined>();
  readonly tabs: Signal<readonly Tab[]> = contentChildren(Tab);
}
