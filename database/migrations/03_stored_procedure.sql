USE EducationSystem;
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetEducationPlacesWithStats
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ep.Id,
        ep.Name,
        ep.City,
        COUNT(s.Id)                             AS ActiveStudentCount,
        ISNULL(AVG(CAST(s.Age AS DECIMAL(5,2))), 0) AS AverageAge
    FROM dbo.EducationPlace ep
    LEFT JOIN dbo.Student s
        ON  s.EducationPlaceId = ep.Id
        AND s.IsActive = 1
    GROUP BY ep.Id, ep.Name, ep.City
    ORDER BY ep.Name;
END;
GO
