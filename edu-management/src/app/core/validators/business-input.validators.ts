/**
 * ולידציות תואמות לוגיקת הבקאנד: שם (אותיות, רווחים, מקף, נקודה, אפוסטרוף) ות״ז ישראלית.
 */
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const PERSON_OR_PLACE_NAME_RE = /^[\u0590-\u05FFa-zA-Z][\u0590-\u05FFa-zA-Z\s'\-.]*$/;

function digitsOnly(s: string | null | undefined): string {
  return String(s ?? '').replace(/\D/g, '');
}

function israeliIdChecksumOk(nineDigits: string): boolean {
  if (nineDigits.length !== 9 || !/^\d{9}$/.test(nineDigits)) return false;
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    let n = Number(nineDigits[i]) * (i % 2 === 0 ? 1 : 2);
    if (n > 9) n = Math.floor(n / 10) + (n % 10);
    sum += n;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(nineDigits[8]);
}

/** שם תלמיד / שם פנימייה / עיר — אותיות חוקיות בלבד (אחרי trim). */
export function personOrPlaceNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value ?? '').trim();
    if (!v) return null;
    if (v.length < 2) return { minLength: true };
    if (v.length > 200) return { maxLength: true };
    if (!PERSON_OR_PLACE_NAME_RE.test(v)) return { invalidChars: true };
    return null;
  };
}

/** ת״ז ישראלית: 5–9 ספרות (מילוי אפסים מובילים) וספרת ביקורת. */
export function israeliIdentityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value as string | null | undefined;
    if (raw == null || raw === '') return null;
    const digits = digitsOnly(raw);
    if (digits.length < 5 || digits.length > 9) return { israeliId: true };
    const padded = digits.length < 9 ? digits.padStart(9, '0') : digits;
    if (!israeliIdChecksumOk(padded)) return { israeliIdChecksum: true };
    return null;
  };
}

/**
 * בעריכת תלמיד: אם השם זהה לרשומה המקורית (אחרי trim) — לא מריצים ולידציית תווים מחמירה,
 * כדי לאפשר שינוי סטטוס פעיל בלבד גם כשיש נתונים ישנים במסד.
 */
export function unchangedOrPersonNameValidator(original: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cur = String(control.value ?? '').trim();
    if (cur === String(original ?? '').trim()) return null;
    return personOrPlaceNameValidator()(control);
  };
}

/**
 * בעריכה: אם הת״ז (אותן ספרות אחרי מילוי לאפסים) לא השתנה — לא דורשים ספרת ביקורת תקינה.
 * תואם ל־ResolveIdentityNumberForUpdate בבקאנד.
 */
export function unchangedOrIsraeliIdentityValidator(original: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const d = digitsOnly(control.value as string | null | undefined);
    const e = digitsOnly(original);
    if (d.length >= 5 && d.length <= 9 && e.length >= 5 && e.length <= 9) {
      const dPad = d.padStart(9, '0');
      const ePad = e.padStart(9, '0');
      if (dPad === ePad) return null;
    }
    return israeliIdentityValidator()(control);
  };
}

/**
 * בעריכה: גיל שלא השתנה מותר גם מחוץ לטווח 5–19 (רשומות ישנות); אחרת — טווח שיבוץ.
 */
export function unchangedOrAgeInEnrollmentRangeValidator(
  originalAge: number,
  min: number,
  max: number,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v === null || v === undefined || v === '') return null;
    const num = Number(v);
    if (!Number.isFinite(num)) return { invalidAge: true };
    if (num === Number(originalAge)) return null;
    if (num < min || num > max) return { min: true };
    return null;
  };
}
