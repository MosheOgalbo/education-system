/**
 * שדה חיפוש עם Material Autocomplete; מממש ControlValueAccessor לשילוב בטפסים; debounce לסינון.
 */
import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  output,
  OnInit,
  inject,
  DestroyRef,
  effect,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged, startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-autocomplete-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteInputComponent),
      multi: true,
    },
  ],
  template: `
    <mat-form-field appearance="outline" class="autocomplete-field">
      <mat-label>{{ label() }}</mat-label>
      <mat-icon matPrefix>search</mat-icon>
      <input
        matInput
        [formControl]="searchControl"
        [matAutocomplete]="auto"
        [placeholder]="placeholder()"
      />

      @if (searchControl.value) {
        <button
          matSuffix
          mat-icon-button
          type="button"
          aria-label="ניקוי החיפוש"
          (click)="clearSearch()"
        >
          <mat-icon>close</mat-icon>
        </button>
      }

      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onOptionSelected($event)">
        @for (option of filteredOptions(); track option) {
          <mat-option [value]="option">{{ option }}</mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [
    `
      .autocomplete-field {
        width: 100%;
      }
    `,
  ],
})
export class AutocompleteInputComponent implements ControlValueAccessor, OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly options = input<string[]>([]);
  readonly label = input('חיפוש');
  readonly placeholder = input('הקלידו לסינון...');
  readonly value = input('');

  readonly valueChange = output<string>();
  readonly optionSelected = output<string | null>();

  protected readonly searchControl = new FormControl<string>('', { nonNullable: true });

  protected readonly filteredOptions = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(150),
      distinctUntilChanged(),
      map((v) => this.filterOptions(v ?? '')),
    ),
    { initialValue: [] as string[] },
  );

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const v = this.value();
      this.searchControl.setValue(v ?? '', { emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(150), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => {
        this.onChange(v ?? '');
        this.valueChange.emit(v ?? '');
      });

    if (this.value()) {
      this.searchControl.setValue(this.value(), { emitEvent: false });
    }
  }

  protected onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.optionSelected.emit(event.option.value as string);
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
    this.optionSelected.emit(null);
  }

  private filterOptions(query: string): string[] {
    const q = query.toLowerCase();
    return this.options().filter((o) => o.toLowerCase().includes(q));
  }

  writeValue(value: string): void {
    this.searchControl.setValue(value ?? '', { emitEvent: false });
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    disabled ? this.searchControl.disable() : this.searchControl.enable();
  }
}
