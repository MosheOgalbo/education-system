namespace EducationSystem.Application.Exceptions;

/// <summary>שגיאת ולידציה או כלל עסקי — ממופה ל-HTTP 400.</summary>
public sealed class ValidationException(string message) : Exception(message);

/// <summary>משאב לא נמצא — ממופה ל-HTTP 404.</summary>
public sealed class NotFoundException(string message)   : Exception(message);
