using Dapper;
using EducationSystem.Application.DTOs;
using EducationSystem.Application.Interfaces;
using System.Data;

namespace EducationSystem.Infrastructure.Repositories;

public sealed class StudentRepository(IDbConnection db) : IStudentRepository
{
    private const string UpsertSql = """
        IF @Id IS NULL OR @Id = 0
            INSERT INTO dbo.Student (Name, IdentityNumber, Age, EducationPlaceId, IsActive, CreatedAt, UpdatedAt)
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.IdentityNumber,
                   INSERTED.Age, INSERTED.EducationPlaceId, INSERTED.IsActive
            VALUES (@Name, @IdentityNumber, @Age, @EducationPlaceId, @IsActive, GETDATE(), GETDATE())
        ELSE
            UPDATE dbo.Student
            SET Name = @Name, IdentityNumber = @IdentityNumber, Age = @Age,
                EducationPlaceId = @EducationPlaceId, IsActive = @IsActive, UpdatedAt = GETDATE()
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.IdentityNumber,
                   INSERTED.Age, INSERTED.EducationPlaceId, INSERTED.IsActive
            WHERE Id = @Id
        """;

    public async Task<StudentDto> UpsertAsync(UpsertStudentDto dto)
        => await db.QuerySingleAsync<StudentDto>(UpsertSql, new
        {
            dto.Id,
            dto.Name,
            dto.IdentityNumber,
            dto.Age,
            dto.EducationPlaceId,
            dto.IsActive
        });

    public async Task<bool> IdentityNumberExistsAsync(string identityNumber, int? excludeId = null)
    {
        const string sql = """
            SELECT COUNT(1) FROM dbo.Student
            WHERE IdentityNumber = @IdentityNumber
              AND (@ExcludeId IS NULL OR Id <> @ExcludeId)
            """;
        return await db.ExecuteScalarAsync<int>(sql,
            new { IdentityNumber = identityNumber, ExcludeId = excludeId }) > 0;
    }
}
