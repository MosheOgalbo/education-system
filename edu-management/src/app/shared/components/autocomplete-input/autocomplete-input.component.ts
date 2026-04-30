import { Component, computed, effect, input, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { map, startWith } from 'rxjs';

export interface AutocompleteOption {
  id: number;
  label: string;
}

@Component({
  selector: 'app-autocomplete-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="full">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        type="text"
        [formControl]="textControl"
        [matAutocomplete]="auto"
        [placeholder]="placeholder()"
      />
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onPick($event.option.value)">
        @for (opt of filtered(); track opt.id) {
          <mat-option [value]="opt">{{ opt.label }}</mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `
    .full {
      width: 100%;
    }
  `,
})
export class AutocompleteInputComponent {
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly options = input.required<AutocompleteOption[]>();
  readonly selectedId = input.required<FormControl<number | null>>();

  readonly textControl = new FormControl('', { nonNullable: true });

  private readonly query = toSignal(
    this.textControl.valueChanges.pipe(
      startWith(''),
      map((s) => s.toLowerCase())
    ),
    { initialValue: '' }
  );

  readonly filtered = computed(() => {
    const q = this.query();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  constructor() {
    effect(() => {
      const opts = this.options();
      const id = this.selectedId().value;
      if (id == null) {
        untracked(() => this.textControl.setValue('', { emitEvent: false }));
        return;
      }
      const found = opts.find((o) => o.id === id);
      untracked(() =>
        this.textControl.setValue(found?.label ?? '', { emitEvent: false })
      );
    });
  }

  onPick(opt: AutocompleteOption): void {
    this.selectedId().setValue(opt.id);
    this.textControl.setValue(opt.label, { emitEvent: false });
  }
}
