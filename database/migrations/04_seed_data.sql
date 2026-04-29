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
        (N'דני כהן',       N'214567891', 15, N'ירושלים', 1),
        (N'מיכל לוי',     N'305812347', 16, N'ירושלים', 1),
        (N'יוסי אברהם',   N'416923458', 14, N'באר שבע',  1),
        (N'נועה דוד',     N'527034569', 17, N'באר שבע',  1),
        (N'איתן גרין',    N'638145670', 13, N'חיפה',     1),
        (N'שירה מזרחי',   N'749256781', 18, N'חיפה',     0)
    ) AS v(Name, IdentityNumber, Age, City, IsActive)
    INNER JOIN dbo.EducationPlace ep ON ep.City = v.City;
END
GO
