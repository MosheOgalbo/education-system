using Dapper;
using EducationSystem.Application.DTOs;
using EducationSystem.Application.Enums;
using EducationSystem.Application.Interfaces;
using System.Data;

namespace EducationSystem.Infrastructure.Repositories;

/// <summary>
/// גישה לטבלת EducationPlace ואגרגציות תלמידים (כולל SP לרשימה מלאה).
/// </summary>
public sealed class EducationPlaceRepository(IDbConnection db) : IEducationPlaceRepository
{
    /// <inheritdoc />
    public async Task<IEnumerable<EducationPlaceStatsDto>> GetAllWithStatsAsync()
        => await db.QueryAsync<EducationPlaceStatsDto>(
            "dbo.sp_GetEducationPlacesWithStats",
            commandType: CommandType.StoredProcedure);

    /// <inheritdoc />
    public async Task<EducationPlaceStatsDto?> GetWithStatsByIdAsync(int id)
    {
        const string sql = """
            SELECT
                ep.Id,
                ep.Name,
                ep.City,
                ep.[Status],
                (SELECT COUNT(1) FROM dbo.Student s2 WHERE s2.EducationPlaceId = ep.Id) AS TotalStudentCount,
                (SELECT COUNT(1) FROM dbo.Student s2 WHERE s2.EducationPlaceId = ep.Id AND s2.IsActive = 1) AS ActiveStudentCount,
                ISNULL((
                    SELECT AVG(CAST(s3.Age AS DECIMAL(5,2)))
                    FROM dbo.Student s3
                    WHERE s3.EducationPlaceId = ep.Id
                ), 0) AS AverageAge
            FROM dbo.EducationPlace ep
            WHERE ep.Id = @Id
            """;
        return await db.QuerySingleOrDefaultAsync<EducationPlaceStatsDto>(sql, new { Id = id });
    }

    /// <inheritdoc />
    public async Task<EducationPlaceStatus?> GetStatusIfExistsAsync(int id)
    {
        const string sql = "SELECT [Status] FROM dbo.EducationPlace WHERE Id = @Id";
        var v = await db.QuerySingleOrDefaultAsync<byte?>(sql, new { Id = id });
        return v is null ? null : (EducationPlaceStatus)v;
    }

    /// <inheritdoc />
    public async Task<EducationPlaceDto> InsertAsync(CreateEducationPlaceDto dto)
    {
        const string sql = """
            INSERT INTO dbo.EducationPlace (Name, City, [Status])
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.City, INSERTED.[Status]
            VALUES (@Name, @City, @Status)
            """;
        return await db.QuerySingleAsync<EducationPlaceDto>(sql, new
        {
            dto.Name,
            dto.City,
            Status = EducationPlaceStatus.Suspended,
        });
    }

    /// <inheritdoc />
    public async Task<EducationPlaceDto?> UpdateAsync(int id, UpdateEducationPlaceDto dto)
    {
        const string sql = """
            UPDATE dbo.EducationPlace
            SET Name = @Name, City = @City
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.City, INSERTED.[Status]
            WHERE Id = @Id
            """;
        return await db.QuerySingleOrDefaultAsync<EducationPlaceDto>(sql,
            new { Id = id, dto.Name, dto.City });
    }

    /// <inheritdoc />
    public async Task<EducationPlaceDto?> SetStatusAsync(int id, EducationPlaceStatus status)
    {
        const string sql = """
            UPDATE dbo.EducationPlace
            SET [Status] = @Status
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.City, INSERTED.[Status]
            WHERE Id = @Id
            """;
        return await db.QuerySingleOrDefaultAsync<EducationPlaceDto>(sql,
            new { Id = id, Status = status });
    }

    /// <inheritdoc />
    public async Task<bool> ExistsAsync(int id)
    {
        const string sql = "SELECT COUNT(1) FROM dbo.EducationPlace WHERE Id = @Id";
        return await db.ExecuteScalarAsync<int>(sql, new { Id = id }) > 0;
    }

    /// <inheritdoc />
    public async Task<int> CountStudentsForPlaceAsync(int educationPlaceId)
    {
        const string sql = """
            SELECT COUNT(1) FROM dbo.Student WHERE EducationPlaceId = @EducationPlaceId
            """;
        return await db.ExecuteScalarAsync<int>(sql, new { EducationPlaceId = educationPlaceId });
    }

    /// <inheritdoc />
    public async Task SetSuspendedIfNoStudentsAsync(int educationPlaceId)
    {
        const string sql = """
            UPDATE dbo.EducationPlace
            SET [Status] = @Suspended
            WHERE Id = @Id
              AND [Status] <> @Inactive
              AND NOT EXISTS (
                  SELECT 1 FROM dbo.Student s WHERE s.EducationPlaceId = @Id
              )
            """;
        await db.ExecuteAsync(sql, new
        {
            Id = educationPlaceId,
            Suspended = EducationPlaceStatus.Suspended,
            Inactive = EducationPlaceStatus.Inactive,
        });
    }

    /// <inheritdoc />
    public async Task TryPromoteSuspendedToActiveWhenHasStudentsAsync(int educationPlaceId)
    {
        const string sql = """
            UPDATE dbo.EducationPlace
            SET [Status] = @Active
            WHERE Id = @Id
              AND [Status] = @Suspended
              AND EXISTS (SELECT 1 FROM dbo.Student s WHERE s.EducationPlaceId = @Id)
            """;
        await db.ExecuteAsync(sql, new
        {
            Id = educationPlaceId,
            Active = EducationPlaceStatus.Active,
            Suspended = EducationPlaceStatus.Suspended,
        });
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM dbo.EducationPlace WHERE Id = @Id";
        return await db.ExecuteAsync(sql, new { Id = id }) > 0;
    }
}
