using Dapper;
using EducationSystem.Application.DTOs;
using EducationSystem.Application.Interfaces;
using System.Data;

namespace EducationSystem.Infrastructure.Repositories;

public sealed class EducationPlaceRepository(IDbConnection db) : IEducationPlaceRepository
{
    public async Task<IEnumerable<EducationPlaceStatsDto>> GetAllWithStatsAsync()
        => await db.QueryAsync<EducationPlaceStatsDto>(
            "dbo.sp_GetEducationPlacesWithStats",
            commandType: CommandType.StoredProcedure);

    public async Task<EducationPlaceStatsDto?> GetWithStatsByIdAsync(int id)
    {
        const string sql = """
            SELECT
                ep.Id,
                ep.Name,
                ep.City,
                COUNT(s.Id) AS ActiveStudentCount,
                ISNULL(AVG(CAST(s.Age AS DECIMAL(5,2))), 0) AS AverageAge
            FROM dbo.EducationPlace ep
            LEFT JOIN dbo.Student s
                ON  s.EducationPlaceId = ep.Id
                AND s.IsActive = 1
            WHERE ep.Id = @Id
            GROUP BY ep.Id, ep.Name, ep.City
            """;
        return await db.QuerySingleOrDefaultAsync<EducationPlaceStatsDto>(sql, new { Id = id });
    }

    public async Task<bool> ExistsAsync(int id)
    {
        const string sql = "SELECT COUNT(1) FROM dbo.EducationPlace WHERE Id = @Id";
        return await db.ExecuteScalarAsync<int>(sql, new { Id = id }) > 0;
    }

    public async Task<int> CountStudentsForPlaceAsync(int educationPlaceId)
    {
        const string sql = """
            SELECT COUNT(1) FROM dbo.Student WHERE EducationPlaceId = @EducationPlaceId
            """;
        return await db.ExecuteScalarAsync<int>(sql, new { EducationPlaceId = educationPlaceId });
    }

    public async Task<EducationPlaceDto> InsertAsync(CreateEducationPlaceDto dto)
    {
        const string sql = """
            INSERT INTO dbo.EducationPlace (Name, City)
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.City
            VALUES (@Name, @City)
            """;
        return await db.QuerySingleAsync<EducationPlaceDto>(sql, new { dto.Name, dto.City });
    }

    public async Task<EducationPlaceDto?> UpdateAsync(int id, UpdateEducationPlaceDto dto)
    {
        const string sql = """
            UPDATE dbo.EducationPlace
            SET Name = @Name, City = @City
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.City
            WHERE Id = @Id
            """;
        return await db.QuerySingleOrDefaultAsync<EducationPlaceDto>(sql,
            new { Id = id, dto.Name, dto.City });
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM dbo.EducationPlace WHERE Id = @Id";
        return await db.ExecuteAsync(sql, new { Id = id }) > 0;
    }
}
