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

    public async Task<bool> ExistsAsync(int id)
    {
        const string sql = "SELECT COUNT(1) FROM dbo.EducationPlace WHERE Id = @Id";
        return await db.ExecuteScalarAsync<int>(sql, new { Id = id }) > 0;
    }
}
