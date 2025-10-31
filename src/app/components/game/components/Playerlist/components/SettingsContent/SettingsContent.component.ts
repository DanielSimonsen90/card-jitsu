import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import SettingsStore, { SETTINGS_OPTIONS, Settings } from '@/stores/SettingsStore';

type Section = {
  key: string;
  label: string;
  settings?: Array<SettingInput>;
};

type SettingInput = {
  key: string;
  label: string;
  type: 'number' | 'select' | 'text';
  options?: Array<{ value: string; label: string; }>;
};

@Component({
  standalone: true,
  selector: 'app-settings-content',
  templateUrl: 'SettingsContent.component.html',
  styleUrl: 'SettingsContent.component.scss',
  imports: [CommonModule, ReactiveFormsModule],
})
export class SettingsContentComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  constructor(
    private formBuilder: FormBuilder,
    private settingsStore: SettingsStore
  ) {
    this.settingsForm = this.formBuilder.group({});
  }

  public settingsForm: FormGroup;
  public sections: Section[] = [];

  public ngOnInit(): void {
    this.buildFromStore();
  }

  private humanizeKey(key: string): string {
    const spaced = key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .toLowerCase();
    return spaced.replace(/(^|\s)\S/g, s => s.toUpperCase());
  }

  private buildFromStore(): void {
    const current: Settings = {
      cards: this.settingsStore.cards,
      deck: this.settingsStore.deck,
      redraw: this.settingsStore.redraw,
      roundTimerSeconds: this.settingsStore.roundTimerSeconds,
    };

    const rootGroup: { [k: string]: AbstractControl; } = {};
    const sections = Object.entries(current).map<Section>(([_sectionKey, sectionValue]) => {
      const sectionKey = _sectionKey as keyof Settings;

      // If primitive, create a single control without validation (store handles it)
      if (sectionValue === null || typeof sectionValue !== 'object') {
        rootGroup[sectionKey] = this.formBuilder.control(sectionValue);

        return {
          key: sectionKey,
          label: this.humanizeKey(sectionKey),
        };
      }

      // object section
      const [controls, childGroup] = Object
        .entries(sectionValue)
        .reduce((acc, [key, controlValue]) => {
          const optionSource = (
            sectionKey === 'deck' && key === 'locationPreference' ? SETTINGS_OPTIONS.deck.locationPreference
              : sectionKey === 'redraw' && key === 'gainMethod' ? SETTINGS_OPTIONS.redraw.gainMethod
                : undefined
          );

          const input: SettingInput = {
            key,
            label: this.humanizeKey(key),
            type: optionSource && Array.isArray(optionSource) ? 'select' :
              typeof controlValue === 'number' ? 'number'
                : 'text',
            options: optionSource && Array.isArray(optionSource)
              ? optionSource.map(value => ({ value, label: this.humanizeKey(value) }))
              : undefined
          };
          const controlPartial: Record<string, AbstractControl> = { [key]: this.formBuilder.control(controlValue) };

          const [inputs, controlsGroup] = acc;
          return [
            [...inputs, input],
            { ...controlsGroup, ...controlPartial }
          ];
        }, [
          new Array<SettingInput>(),
          {} as Record<string, AbstractControl>
        ]);

      rootGroup[sectionKey] = this.formBuilder.group(childGroup);

      return {
        key: sectionKey,
        label: this.humanizeKey(sectionKey),
        settings: controls
      };
    });

    this.sections = sections;
    this.settingsForm = this.formBuilder.group(rootGroup);
  }

  public onSubmit(): void {
    try {
      for (const key in this.settingsForm.value) {
        const value = this.settingsForm.value[key];
        if (!(key in this.settingsStore)) throw new Error(`Invalid setting key: ${key}`);
        this.settingsStore[key as keyof Settings] = value;
      }

      // Settings saved successfully, close the modal
      this.closeModal.emit();
    } catch (error) {
      console.error('Settings validation failed:', error);
      alert(`Validation error: ${error instanceof Error ? error.message : 'Invalid settings'}`);
    }
  }

  public onReset(): void {
    this.buildFromStore();
  }
}