import { Component, inject } from '@angular/core';
import { Tabs } from '~theme/components/tabs';
import { Tab } from '~theme/components/tab';
import { Switch } from '~theme/components/switch';
import { Configuration, ConfigurationColor } from '../../services/configuration/configuration';
import { Input } from '~theme/components/input';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, filter, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-modal-configurator',
  imports: [
    Tabs,
    Tab,
    Switch,
    Input,
    ReactiveFormsModule,
    UpperCasePipe,
  ],
  template: `
    <app-tabs class="block w-full h-full px-4 py-2">
      <app-tab value="tab1" label="Template">
        <ul class="w-full flex flex-col pt-4 gap-4">
          <li class="w-full flex justify-between">
            <div>
              <p class="font-semibold">
                Show explanation:
              </p>
            </div>
            
            <div>
              <app-switch
                  [checked]="configuration.showExplanation()"
                  (checkedChange)="configuration.updateState({ showExplanation: $event })">
              </app-switch>
            </div>
          </li>
          
          <li class="w-full flex justify-between items-center">
            <div class="w-full">
              <p class="font-semibold">
                Border radius:
              </p>
            </div>
            
            <div class="w-auto">
              <input class="max-w-[5rem] text-center"
                     [formControl]="borderRadiusControl"
                     size="xs"
                     app-input
                     type="text" />
            </div>
          </li>
          
          <li class="w-full flex justify-between items-center">
            <div class="w-full">
              <p class="font-semibold">
                Modal title:
              </p>
            </div>
            
            <div class="w-auto">
              <input class="text-center"
                     [formControl]="modalTitleControl"
                     size="xs"
                     app-input
                     type="text" />
            </div>
          </li>
          
          <li class="w-full flex justify-between">
            <div>
              <p class="font-semibold">
                Show "not installed" label:
              </p>
            </div>

            <div>
              <app-switch
                  [checked]="configuration.showNotInstalledLabel()"
                  (checkedChange)="configuration.updateState({ showNotInstalledLabel: $event })">
              </app-switch>
            </div>
          </li>

          <li class="w-full flex justify-between items-center">
            <div class="w-full">
              <p class="font-semibold">
                "not installed" text:
              </p>
            </div>

            <div class="w-auto">
              <input class="text-center"
                     [formControl]="notInstalledLabelTextControl"
                     size="xs"
                     app-input
                     type="text" />
            </div>
          </li>
        </ul>
      </app-tab>
      
      <app-tab value="tab2" label="Colors">
        <ul class="w-full flex flex-col pt-4 gap-4">
          @for (colorControl of colorsControls.controls; track colorControl.value.variable) {
            <li class="w-full flex justify-between items-center">
              <div class="w-full">
                <p class="text-sm font-semibold">
                  {{ colorControl.value.name }}:
                </p>
              </div>

              <div [formGroup]="colorControl" class="w-auto flex items-center gap-2">
                <small>{{ colorControl.value.value }}</small>
                <input formControlName="value"
                       size="xs"
                       type="color" />
              </div>
            </li>
          }
        </ul>
      </app-tab>
      
      <app-tab value="tab3" label="Wallets">
        <ul class="w-full flex flex-col pt-4 gap-4">
          @for (control of enableWalletsControls.controls; track control.value.id) {
            <li [formGroup]="control" class="w-full flex justify-between">
              <div>
                <p class="font-semibold">
                  {{ control.value.id | uppercase }}:
                </p>
              </div>

              <div>
                <app-switch formControlName="enabled"></app-switch>
              </div>
            </li>
          }
        </ul>
      </app-tab>
    </app-tabs>
  `,
  styles: `
    :host {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    }
  `
})
export class ModalConfigurator {
  configuration: Configuration = inject<Configuration>(Configuration);

  colorsControls: ColorsControlsType = new FormArray(this.configuration.colors().map((color: ConfigurationColor): FormGroup => {
    return new FormGroup({
      name: new FormControl<string | null>(color.name, [Validators.required, Validators.minLength(1)]),
      variable: new FormControl<string | null>(color.variable, [Validators.required, Validators.minLength(1)]),
      value: new FormControl<string | null>(color.value, [Validators.required, Validators.minLength(1)]),
    });
  }));

  enableWalletsControls: EnableWalletsControlType = new FormArray(
    this.configuration.wallets().map((wallet: string): FormGroup => {
      return new FormGroup({
        id: new FormControl<string | null>(wallet, [Validators.required]),
        enabled: new FormControl<boolean | null>(true, [Validators.required]),
      });
    }),
  );

  borderRadiusControl: FormControl<string | null> = new FormControl<string | null>(this.configuration.borderRadius());
  borderRadiusUpdate: Subscription = this.borderRadiusControl.valueChanges
    .pipe(filter(Boolean), takeUntilDestroyed(), debounceTime(500))
    .subscribe((value: string): void => this.configuration.updateState({ borderRadius: value }));

  modalTitleControl: FormControl<string | null> = new FormControl<string | null>(this.configuration.modalTitle());
  modalTitleUpdate: Subscription = this.modalTitleControl.valueChanges
    .pipe(filter(Boolean), takeUntilDestroyed())
    .subscribe((value: string): void => this.configuration.updateState({ modalTitle: value }));

  notInstalledLabelTextControl: FormControl<string | null> = new FormControl<string | null>(this.configuration.notInstalledLabelText());
  notInstalledLabelTextUpdate: Subscription = this.notInstalledLabelTextControl.valueChanges
    .pipe(filter(Boolean), takeUntilDestroyed())
    .subscribe((value: string): void => this.configuration.updateState({ notInstalledLabelText: value }));

  updateColorSubscription: Subscription = this.colorsControls.valueChanges
    .pipe(filter(Boolean), takeUntilDestroyed(), debounceTime(500))
    .subscribe((colors: any): void => {
      this.configuration.updateState({ colors });
    });

  updateEnabledWalletsSubscription: Subscription = this.enableWalletsControls.valueChanges
    .pipe(filter(Boolean), takeUntilDestroyed())
    .subscribe((enabledWallets): void => {
      const wallets: any = enabledWallets
        .filter(wallet => !!wallet.enabled)
        .map(({ id }) => id);

      this.configuration.updateState({ wallets });
    });
}

type ColorsControlsType = FormArray<FormGroup<{
  name: FormControl<string | null>;
  variable: FormControl<string | null>;
  value: FormControl<string | null>;
}>>;

type EnableWalletsControlType = FormArray<FormGroup<{
  id: FormControl<string | null>;
  enabled: FormControl<boolean | null>;
}>>;
