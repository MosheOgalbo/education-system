namespace EducationSystem.Application.Exceptions;

public sealed class ValidationException(string message) : Exception(message);
public sealed class NotFoundException(string message)   : Exception(message);
