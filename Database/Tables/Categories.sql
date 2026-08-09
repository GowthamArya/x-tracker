CREATE TABLE Categories
(
    Id INT IDENTITY(1,1) NOT NULL,
    UserId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Type NVARCHAR(10) NOT NULL,
    CreatedAt DATETIME2 NOT NULL,

    CONSTRAINT PK_Categories
        PRIMARY KEY (Id),

    CONSTRAINT FK_Categories_Users_UserId
        FOREIGN KEY (UserId)
        REFERENCES Users(Id)
        ON DELETE CASCADE
);