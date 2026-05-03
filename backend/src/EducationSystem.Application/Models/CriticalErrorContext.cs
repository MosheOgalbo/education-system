namespace EducationSystem.Application.Models;

/// <summary>מטא־דאטה מינימלית לבקשה — לשכבת Application בלי תלות ב-ASP.NET.</summary>
public sealed record CriticalErrorContext(
    string TraceIdentifier,
    string Method,
    string Path,
    string? QueryString);
