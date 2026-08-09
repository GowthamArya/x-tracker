CREATE TABLE Accounts
(
    Id INT IDENTITY(1,1) NOT NULL,
    UserId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    OpeningBalance DECIMAL(18,2) NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL,

    CONSTRAINT PK_Accounts
        PRIMARY KEY (Id),

    CONSTRAINT FK_Accounts_Users_UserId
        FOREIGN KEY (UserId)
        REFERENCES Users(Id)
        ON DELETE CASCADE
);