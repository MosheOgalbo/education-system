using System.Globalization;
using System.Text.RegularExpressions;
using EducationSystem.Application.Exceptions;

namespace EducationSystem.Application.Validation;

/// <summary>
/// ולידציות טקסט ות״ז ישראלית לשימוש בשירותי Application.
/// </summary>
public static partial class BusinessInputValidators
{
    private const int MaxNameLength = 200;
    private const int MinNameLength = 2;

    [GeneratedRegex(@"^[\p{IsHebrew}a-zA-Z][\p{IsHebrew}a-zA-Z\s'\-\.]*$", RegexOptions.CultureInvariant)]
    private static partial Regex PersonOrPlaceNameRegex();

    /// <summary>שם תלמיד: אותיות (עברית/אנגלית), רווחים, מקף, נקודה, אפוסטרוף; ללא ספרות או תווים מיוחדים אחרים.</summary>
    public static void ValidateStudentName(string name)
    {
        ValidateLabeledText("שם התלמיד", name, required: true);
    }

    /// <summary>שם או עיר של פנימייה — אותות חוקיות בלבד.</summary>
    public static void ValidateEducationPlaceName(string name) =>
        ValidateLabeledText("שם הפנימייה", name, required: true);

    /// <summary>עיר — אותות חוקיות בלבד.</summary>
    public static void ValidateEducationPlaceCity(string city) =>
        ValidateLabeledText("עיר", city, required: true);

    private static void ValidateLabeledText(string label, string value, bool required)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            if (required)
                throw new ValidationException($"{label} הוא שדה חובה.");
            return;
        }

        var t = value.Trim();
        if (t.Length < MinNameLength)
            throw new ValidationException($"{label} חייב להכיל לפחות {MinNameLength} תווים.");
        if (t.Length > MaxNameLength)
            throw new ValidationException($"{label} ארוך מדי.");

        if (!PersonOrPlaceNameRegex().IsMatch(t))
            throw new ValidationException(
                $"{label} מכיל תווים שאינם מותרים. מותרות אותיות בעברית ובאנגלית, רווחים, מקף, נקודה ואפוסטרוף בלבד.");
    }

    /// <summary>מספר זהות ישראלי: 5–9 ספרות (כולל מילוי אפסים מובילים ל-9), עם ספרת ביקורת תקפה.</summary>
    public static string NormalizeIsraeliIdentityNumber(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            throw new ValidationException("מספר זהות הוא שדה חובה.");

        var digits = new string(raw.Where(char.IsAsciiDigit).ToArray());
        if (digits.Length is < 5 or > 9)
            throw new ValidationException("מספר הזהות אינו בתבנית חוקית.");

        var padded = digits.Length < 9
            ? digits.PadLeft(9, '0')
            : digits;

        if (!IsValidIsraeliIdentityChecksum(padded))
            throw new ValidationException("מספר הזהות אינו חוקי (ספרת ביקורת שגויה).");

        return padded;
    }

    private static bool IsValidIsraeliIdentityChecksum(string nineDigits)
    {
        if (nineDigits.Length != 9 || nineDigits.Any(c => !char.IsAsciiDigit(c)))
            return false;

        var sum = 0;
        for (var i = 0; i < 8; i++)
        {
            var n = (nineDigits[i] - '0') * (i % 2 == 0 ? 1 : 2);
            sum += n > 9 ? n / 10 + n % 10 : n;
        }

        var check = (10 - sum % 10) % 10;
        return check == nineDigits[8] - '0';
    }
}
