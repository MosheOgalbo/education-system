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

    public async Task<IEnumerable<StudentDto>> GetAllAsync(int? educationPlaceId)
    {
        if (educationPlaceId is { } pid)
        {
            const string sql = """
                SELECT Id, Name, IdentityNumber, Age, EducationPlaceId, IsActive
                FROM dbo.Student
                WHERE EducationPlaceId = @EducationPlaceId
                ORDER BY Name
                """;
            return await db.QueryAsync<StudentDto>(sql, new { EducationPlaceId = pid });
        }

        const string sqlAll = """
            SELECT Id, Name, IdentityNumber, Age, EducationPlaceId, IsActive
            FROM dbo.Student
            ORDER BY Name
            """;
        return await db.QueryAsync<StudentDto>(sqlAll);
    }

    public async Task<StudentDto?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT Id, Name, IdentityNumber, Age, EducationPlaceId, IsActive
            FROM dbo.Student
            WHERE Id = @Id
            """;
        return await db.QuerySingleOrDefaultAsync<StudentDto>(sql, new { Id = id });
    }

    public async Task<StudentDto> InsertAsync(CreateStudentDto dto)
    {
        const string sql = """
            INSERT INTO dbo.Student (Name, IdentityNumber, Age, EducationPlaceId, IsActive, CreatedAt, UpdatedAt)
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.IdentityNumber,
                   INSERTED.Age, INSERTED.EducationPlaceId, INSERTED.IsActive
            VALUES (@Name, @IdentityNumber, @Age, @EducationPlaceId, @IsActive, GETDATE(), GETDATE())
            """;
        return await db.QuerySingleAsync<StudentDto>(sql, new
        {
            dto.Name,
            dto.IdentityNumber,
            dto.Age,
            dto.EducationPlaceId,
            dto.IsActive
        });
    }

    public async Task<StudentDto?> UpdateAsync(int id, UpdateStudentDto dto)
    {
        const string sql = """
            UPDATE dbo.Student
            SET Name = @Name, IdentityNumber = @IdentityNumber, Age = @Age,
                EducationPlaceId = @EducationPlaceId, IsActive = @IsActive, UpdatedAt = GETDATE()
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.IdentityNumber,
                   INSERTED.Age, INSERTED.EducationPlaceId, INSERTED.IsActive
            WHERE Id = @Id
            """;
        return await db.QuerySingleOrDefaultAsync<StudentDto>(sql, new
        {
            Id = id,
            dto.Name,
            dto.IdentityNumber,
            dto.Age,
            dto.EducationPlaceId,
            dto.IsActive
        });
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM dbo.Student WHERE Id = @Id";
        return await db.ExecuteAsync(sql, new { Id = id }) > 0;
    }

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
