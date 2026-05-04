USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'EducationSystem')
    CREATE DATABASE EducationSystem;
GO

USE EducationSystem;
GO

-- EducationPlace
CREATE TABLE dbo.EducationPlace (
    Id        INT IDENTITY(1,1)   NOT NULL,
    Name      NVARCHAR(200)       NOT NULL,
    City      NVARCHAR(100)       NOT NULL,
    CreatedAt DATETIME2           NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_EducationPlace PRIMARY KEY (Id)
);
GO

-- Student
CREATE TABLE dbo.Student (
    Id                INT IDENTITY(1,1)   NOT NULL,
    Name              NVARCHAR(200)       NOT NULL,
    IdentityNumber    NVARCHAR(9)         NOT NULL,
    Age               INT                 NOT NULL,
    EducationPlaceId  INT                 NOT NULL,
    IsActive          BIT                 NOT NULL DEFAULT 1,
    CreatedAt         DATETIME2           NOT NULL DEFAULT GETDATE(),
    UpdatedAt         DATETIME2           NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Student             PRIMARY KEY (Id),
    CONSTRAINT FK_Student_Education   FOREIGN KEY (EducationPlaceId)
        REFERENCES dbo.EducationPlace (Id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO
