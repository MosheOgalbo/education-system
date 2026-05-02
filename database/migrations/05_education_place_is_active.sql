USE EducationSystem;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.EducationPlace') AND name = N'IsActive'
)
BEGIN
    ALTER TABLE dbo.EducationPlace ADD IsActive BIT NOT NULL
        CONSTRAINT DF_EducationPlace_IsActive DEFAULT (1);
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetEducationPlacesWithStats
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ep.Id,
        ep.Name,
        ep.City,
        ep.IsActive,
        COUNT(s.Id) AS ActiveStudentCount,
        ISNULL(AVG(CAST(s.Age AS DECIMAL(5,2))), 0) AS AverageAge
    FROM dbo.EducationPlace ep
    LEFT JOIN dbo.Student s
        ON  s.EducationPlaceId = ep.Id
        AND s.IsActive = 1
    GROUP BY ep.Id, ep.Name, ep.City, ep.IsActive
    ORDER BY ep.Name;
END;
GO
