USE EducationSystem;
GO

-- Student indexes
CREATE UNIQUE INDEX UX_Student_IdentityNumber
    ON dbo.Student (IdentityNumber);

CREATE INDEX IX_Student_EducationPlaceId
    ON dbo.Student (EducationPlaceId);

CREATE INDEX IX_Student_IsActive
    ON dbo.Student (IsActive);

-- EducationPlace indexes
CREATE INDEX IX_EducationPlace_City
    ON dbo.EducationPlace (City);
GO
