# 🔧 MODERN ANGULAR PATTERNS GUIDE

## For Senior Developers & Team Leads

**Internal Technical Standard v1.0**  
**Updated:** May 4, 2026

---

## TABLE OF CONTENTS

1. [Component Architecture](#component-architecture)
2. [State Management](#state-management)
3. [Forms & Validation](#forms--validation)
4. [Async Operations](#async-operations)
5. [Accessibility](#accessibility)
6. [Performance](#performance)
7. [Testing](#testing)
8. [Common Patterns](#common-patterns)

---

## COMPONENT ARCHITECTURE

### ✅ DO: Modern Standalone Components

```typescript
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-my-component',
  standalone: true,  // ✅ Always standalone (v20+ default)
  changeDetection: ChangeDetectionStrategy.OnPush,  // ✅ Manual change detection
  imports: [CommonModule, Material...],
  template: `...`,
  styles: [`...`],
})
export class MyComponent {
  // ✅ Use input() function (not @Input decorator)
  name = input.required<string>();
  age = input<number>(0);

  // ✅ Use output() function (not @Output decorator)
  nameChange = output<string>();

  onNameChange(newName: string) {
    this.nameChange.emit(newName);
  }
}
```

### ❌ DON'T: NgModule-based Components

```typescript
// ❌ OUTDATED (Angular < 15)
@NgModule({
  declarations: [MyComponent],
  imports: [CommonModule],
})
export class MyModule {}
```

### ✅ DO: Inject Dependencies with inject()

```typescript
import { inject } from '@angular/core';

export class MyComponent {
  private router = inject(Router);  // ✅ Use inject()
  private http = inject(HttpClient);
  private store = inject(MyStore);

  navigate() {
    this.router.navigate(['/home']);
  }
}
```

### ❌ DON'T: Constructor Injection

```typescript
// ❌ OUTDATED (still works, but inject is cleaner)
constructor(private router: Router) {}
```

---

## STATE MANAGEMENT

### ✅ DO: Signals for Local Component State

```typescript
import { signal, computed } from '@angular/core';

export class MyComponent {
  // ✅ Local component state with signals
  private count = signal(0);
  
  // ✅ Derived state with computed()
  isEven = computed(() => this.count() % 2 === 0);

  increment() {
    this.count.update(c => c + 1);  // ✅ Use update, not mutate
  }

  reset() {
    this.count.set(0);  // ✅ Use set for complete replacement
  }
}
```

### ✅ DO: Store with Composite State

```typescript
interface AppState {
  user: User | null;
  items: Item[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AppStore {
  private state = signal<AppState>(initialState);

  // ✅ Expose readonly version
  readonly state$ = this.state.asReadonly();

  // ✅ Derived state with computed
  readonly user = computed(() => this.state().user);
  readonly filteredItems = computed(() => 
    this.state().items.filter(/* logic */)
  );

  // ✅ Atomic updates
  updateFilters(newFilters: FilterState) {
    this.state.update(s => ({
      ...s,
      filters: newFilters
    }));
  }
}
```

### ❌ DON'T: BehaviorSubjects or RxJS for Local State

```typescript
// ❌ OUTDATED pattern (works, but signals are better)
private count$ = new BehaviorSubject(0);

// Signals are:
// - More readable (count() vs count$.value)
// - More efficient (no subscription boilerplate)
// - Type-safe (no null checks needed)
```

---

## FORMS & VALIDATION

### ✅ DO: FormBuilder with Reactive Forms

```typescript
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, ...],
})
export class UserFormComponent {
  private fb = inject(FormBuilder);

  // ✅ Use FormBuilder for type safety
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    age: [0, [Validators.required, Validators.min(0), Validators.max(150)]],
  });

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue();  // ✅ Always check valid first
      // Process data...
    }
  }
}
```

### ✅ DO: Custom Validators

```typescript
function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const age = parseInt(control.value, 10);
    return age >= minAge ? null : { minAge: { value: control.value } };
  };
}

// Usage:
form = this.fb.group({
  age: [0, minAgeValidator(18)],
});
```

### ✅ DO: Form State in Signals

```typescript
@Component({
  template: `
    @if (form.valid && !isSubmitting()) {
      <button (click)="submit()">Submit</button>
    }
  `,
})
export class MyForm {
  form = this.fb.group({ /* ... */ });
  isSubmitting = signal(false);  // ✅ Form state in signal

  submit() {
    this.isSubmitting.set(true);
    this.store.saveForm(this.form.value).then(() => {
      this.isSubmitting.set(false);
    });
  }
}
```

### ❌ DON'T: Two-Way Binding with ngModel

```typescript
// ❌ OUTDATED pattern
<input [(ngModel)]="name" />  // Use FormControl instead
```

---

## ASYNC OPERATIONS

### ✅ DO: Async/Await with Proper Cleanup

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-data',
  standalone: true,
})
export class DataComponent {
  private store = inject(MyStore);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    // ✅ Subscription automatically cleaned up on destroy
    this.store.data$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        // Handle data
      });
  }
}
```

### ✅ DO: Async/Await in Services

```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);

  // ✅ Use async/await for single operations
  async fetchUser(id: string): Promise<User> {
    return this.http.get<User>(`/api/users/${id}`).toPromise() ?? 
      Promise.reject('Failed to load');
  }
}

// Usage:
const user = await this.dataService.fetchUser('123');
```

### ✅ DO: Handle Errors Properly

```typescript
@Component({
  selector: 'app-user-detail',
})
export class UserDetailComponent {
  private service = inject(UserService);
  private toast = inject(ToastService);

  async loadUser(id: string) {
    try {
      const user = await this.service.getUser(id);
      // Process user
    } catch (error) {
      // ✅ Always handle errors
      this.toast.error('Failed to load user');
      console.error(error);
    }
  }
}
```

### ❌ DON'T: Unmanaged Subscriptions

```typescript
// ❌ Memory leak (subscription never cleaned up)
this.data$.subscribe(data => { /* ... */ });

// ✅ Instead use:
this.data$
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(data => { /* ... */ });
```

---

## ACCESSIBILITY

### ✅ DO: Semantic HTML + ARIA

```html
<!-- ✅ Semantic header -->
<header role="banner">
  <h1>My Application</h1>
</header>

<!-- ✅ Search form with proper roles -->
<form role="search">
  <label for="search-input">Search:</label>
  <input id="search-input" type="search" />
</form>

<!-- ✅ Navigation with label -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<!-- ✅ Icon button with aria-label -->
<button 
  type="button"
  (click)="openMenu()"
  aria-label="Open menu"
  [attr.aria-expanded]="isOpen()"
  aria-haspopup="menu"
>
  <mat-icon aria-hidden="true">menu</mat-icon>
</button>

<!-- ✅ Dynamic content with aria-live -->
<div aria-live="polite">
  {{ itemCount }} items loaded
</div>

<!-- ✅ Loading indicator -->
<div role="status" aria-live="polite" aria-label="Loading">
  <mat-spinner></mat-spinner>
</div>

<!-- ✅ Error with role="alert" -->
<div role="alert">
  {{ error }}
</div>
```

### ✅ DO: Images with Alt Text

```html
<!-- ✅ Use NgOptimizedImage -->
<img 
  [ngSrc]="imageUrl" 
  alt="Description of image"
  width="300"
  height="200"
/>

<!-- ❌ DON'T use bare img tag without alt -->
<img src="..." />  <!-- BAD - no alt text -->
```

### ✅ DO: Color + Text for Status

```html
<!-- ✅ Don't rely on color alone -->
<span style="color: red">✗ Error</span>  <!-- Good: has symbol + text -->

<!-- ❌ Color alone is not accessible -->
<span style="color: red">Status</span>  <!-- Bad: color-blind users won't understand -->
```

---

## PERFORMANCE

### ✅ DO: OnPush Change Detection

```typescript
@Component({
  selector: 'app-list-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,  // ✅ ALWAYS include
  template: '...', 
})
export class ListItemComponent {
  // Only updates when input changes, event fires, or observable emits
}
```

### ✅ DO: TrackBy Function

```html
<!-- ✅ Always use trackBy in *for loops (or @for with track) -->
<div @for="item of items; track item.id">
  {{ item.name }}
</div>

<!-- Or with identifiers in older syntax: -->
<div *ngFor="let item of items; trackBy: trackById">
  {{ item.name }}
</div>
```

```typescript
trackById(index: number, item: any) {
  return item.id;  // ✅ Return unique identifier
}
```

### ✅ DO: Lazy Loading Routes

```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    // ✅ Component loads only when route is accessed
    loadComponent: () => 
      import('./dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
  },
  {
    path: 'users',
    loadChildren: () => 
      import('./users/users.routes')
        .then(m => m.USERS_ROUTES),
  },
];
```

### ❌ DON'T: Heavy Computations in Templates

```html
<!-- ❌ BAD: Runs every change detection cycle -->
<div>{{ expensiveCalculation() }}</div>

<!-- ✅ GOOD: Uses computed() - memoized result -->
<div>{{ memoizedResult() }}</div>
```

```typescript
expensiveCalculation() {
  // This runs EVERY cycle - SLOW
  return arr.filter(x => x.price > 100).map(x => x.total).reduce((a,b) => a+b);
}

// ✅ This runs only when input changes
memoizedResult = computed(() => {
  return arr.filter(x => x.price > 100).map(x => x.total).reduce((a,b) => a+b);
});
```

---

## TESTING

### ✅ DO: Unit Tests with Proper Mocking

```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let mockStore: jasmine.SpyObj<MyStore>;

  beforeEach(async () => {
    // ✅ Create mock
    mockStore = jasmine.createSpyObj('MyStore', ['getData']);
    
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        { provide: MyStore, useValue: mockStore }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it('should display loading state', () => {
    // ✅ Arrange
    mockStore.isLoading$ = signal(true);

    // ✅ Act
    fixture.detectChanges();

    // ✅ Assert
    expect(fixture.nativeElement.querySelector('.loader')).toBeTruthy();
  });
});
```

### ✅ DO: E2E Tests for Happy Paths

```typescript
describe('User Flow', () => {
  it('should create new user', async () => {
    // ✅ Arrange
    await page.goto('http://localhost:4200/users/new');

    // ✅ Act
    await page.fill('#name-input', 'John Doe');
    await page.fill('#email-input', 'john@example.com');
    await page.click('button[type="submit"]');

    // ✅ Assert
    await expect(page).toHaveURL('/users');
  });
});
```

---

## COMMON PATTERNS

### Dialog Pattern

```typescript
// ✅ Proper dialog handling
@Component({
  template: `
    <button (click)="openDialog()">Open</button>
  `,
})
export class MyComponent {
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  openDialog() {
    const ref = this.dialog.open(MyDialogComponent);
    
    ref.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result) {
          // Handle result
        }
      });
  }
}
```

### Store Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class TodoStore {
  private todos = signal<Todo[]>([]);
  
  readonly todos$ = this.todos.asReadonly();
  readonly count = computed(() => this.todos().length);

  async loadTodos() {
    const todos = await this.api.getTodos();
    this.todos.set(todos);
  }

  addTodo(text: string) {
    this.todos.update(t => [...t, { id: Date.now(), text }]);
  }
}
```

### Error Boundary Pattern

```typescript
@Component({
  selector: 'app-error-boundary',
  standalone: true,
  template: `
    @if (error()) {
      <app-error-state [error]="error()" (retry)="retry()" />
    } @else {
      <ng-content />
    }
  `,
})
export class ErrorBoundaryComponent {
  error = signal<Error | null>(null);

  retry() {
    this.error.set(null);
  }
}
```

---

## ANTI-PATTERNS TO AVOID

### ❌ Mutating Signals

```typescript
// ❌ DON'T mutate signals
const count = signal(0);
count().value = 5;  // WRONG

// ✅ DO use update() or set()
count.update(c => c + 5);
count.set(5);
```

### ❌ NgOnInit, NgOnDestroy

```typescript
// ❌ OUTDATED
@Component({...})
export class OldComponent implements OnInit, OnDestroy {
  ngOnInit() { /* ... */ }
  ngOnDestroy() { /* ... */ }
}

// ✅ MODERN (with signals)
@Component({...})
export class ModernComponent {
  constructor() {
    // Initialize here
  }
  // Cleanup handled by takeUntilDestroyed()
}
```

### ❌ @HostBinding, @HostListener

```typescript
// ❌ OUTDATED
@Component({
  @HostBinding('class.active') isActive: boolean;
  @HostListener('click') onClick() { }
})

// ✅ MODERN
@Component({
  host: {
    '[class.active]': 'isActive()',
    '(click)': 'onClick()',
  }
})
```

---

## CODE REVIEW TEMPLATE

When reviewing PRs, use this checklist:

- [ ] All components standalone with `changeDetection: OnPush`?
- [ ] No `OnInit`, `OnDestroy` lifecycle hooks?
- [ ] All subscriptions cleaned up with `takeUntilDestroyed()`?
- [ ] State uses signals, not BehaviorSubjects?
- [ ] Forms use FormBuilder?
- [ ] ARIA labels on interactive elements?
- [ ] No `*ngIf`, `*ngFor` (use `@if`, `@for`)?
- [ ] TrackBy function on loops?
- [ ] Error handling in async operations?
- [ ] Tests cover happy path + edge cases?
- [ ] TypeScript strict mode compliance?

---

**Document Version:** 1.0  
**Last Updated:** May 4, 2026  
**Angular Version:** 20+  
**Status:** Production Standard


