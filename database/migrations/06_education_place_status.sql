USE EducationSystem;
GO

/* שלושה מצבים: 0=Active, 1=Suspended (אין תלמידים), 2=Inactive (ידני, ניתן למחוק) */
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.EducationPlace') AND name = N'Status'
)
BEGIN
    ALTER TABLE dbo.EducationPlace ADD [Status] TINYINT NOT NULL
        CONSTRAINT DF_EducationPlace_Status DEFAULT (0);
END
GO

/* מיגרציה מ-IsActive (אם קיים) */
IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.EducationPlace') AND name = N'IsActive'
)
BEGIN
    UPDATE dbo.EducationPlace
    SET [Status] = CASE WHEN IsActive = 1 THEN 0 ELSE 2 END;

    /* פעילה ללא אף תלמיד בשורות Student → השהייה */
    UPDATE ep
    SET [Status] = 1
    FROM dbo.EducationPlace ep
    WHERE ep.[Status] = 0
      AND NOT EXISTS (SELECT 1 FROM dbo.Student s WHERE s.EducationPlaceId = ep.Id);

    DECLARE @dc SYSNAME = (
        SELECT dc.name
        FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.default_object_id = dc.object_id
        WHERE dc.parent_object_id = OBJECT_ID(N'dbo.EducationPlace') AND c.name = N'IsActive'
    );
    IF @dc IS NOT NULL
        EXEC(N'ALTER TABLE dbo.EducationPlace DROP CONSTRAINT [' + @dc + N']');

    ALTER TABLE dbo.EducationPlace DROP COLUMN IsActive;
END
GO

/* מסד שכבר עם Status בלבד: השהייה לריקים — לא דורס «לא פעילה» */
UPDATE ep
SET [Status] = 1
FROM dbo.EducationPlace ep
WHERE ep.[Status] = 0
  AND NOT EXISTS (SELECT 1 FROM dbo.Student s WHERE s.EducationPlaceId = ep.Id);
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetEducationPlacesWithStats
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ep.Id,
        ep.Name,
        ep.City,
        ep.[Status],
        (SELECT COUNT(1) FROM dbo.Student s2 WHERE s2.EducationPlaceId = ep.Id) AS TotalStudentCount,
        COUNT(s.Id) AS ActiveStudentCount,
        ISNULL(AVG(CAST(s.Age AS DECIMAL(5,2))), 0) AS AverageAge
    FROM dbo.EducationPlace ep
    LEFT JOIN dbo.Student s
        ON  s.EducationPlaceId = ep.Id
        AND s.IsActive = 1
    GROUP BY ep.Id, ep.Name, ep.City, ep.[Status]
    ORDER BY ep.Name;
END;
GO
