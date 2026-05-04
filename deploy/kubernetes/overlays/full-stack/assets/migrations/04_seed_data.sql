USE EducationSystem;
GO

SET NOCOUNT ON;

-- Idempotent demo data for API / UI
IF NOT EXISTS (SELECT 1 FROM dbo.EducationPlace)
BEGIN
    INSERT INTO dbo.EducationPlace (Name, City)
    VALUES (N'פנימיית ההר', N'ירושלים'),
           (N'פנימיית הנגב', N'באר שבע'),
           (N'פנימיית הכרמל', N'חיפה');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Student)
BEGIN
    INSERT INTO dbo.Student (Name, IdentityNumber, Age, EducationPlaceId, IsActive)
    SELECT v.Name, v.IdentityNumber, v.Age, ep.Id, v.IsActive
    FROM (VALUES
        (N'דני כהן',       N'100000009', 15, N'ירושלים', 1),
        (N'מיכל לוי',     N'100000017', 16, N'ירושלים', 1),
        (N'יוסי אברהם',   N'100000025', 14, N'באר שבע',  1),
        (N'נועה דוד',     N'100000033', 17, N'באר שבע',  1),
        (N'איתן גרין',    N'100000041', 13, N'חיפה',     1),
        (N'שירה מזרחי',   N'100000058', 18, N'חיפה',     0)
    ) AS v(Name, IdentityNumber, Age, City, IsActive)
    INNER JOIN dbo.EducationPlace ep ON ep.City = v.City;
END
GO
