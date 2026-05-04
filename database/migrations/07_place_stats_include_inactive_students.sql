USE EducationSystem;
GO

/* ממוצע גיל לכל התלמידים המשויכים; ספירת פעילים/סה״כ כתתי-שאילתות (ללא JOIN שמדלג על לא פעילים). */
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
        (SELECT COUNT(1) FROM dbo.Student s2 WHERE s2.EducationPlaceId = ep.Id AND s2.IsActive = 1) AS ActiveStudentCount,
        ISNULL((
            SELECT AVG(CAST(s3.Age AS DECIMAL(5,2)))
            FROM dbo.Student s3
            WHERE s3.EducationPlaceId = ep.Id
        ), 0) AS AverageAge
    FROM dbo.EducationPlace ep
    ORDER BY ep.Name;
END;
GO
