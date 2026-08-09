CREATE TABLE Transactions
(
    Id BIGINT IDENTITY(1,1) NOT NULL,
    UserId INT NOT NULL,
    AccountId INT NOT NULL,
    CategoryId INT NOT NULL,

    Title NVARCHAR(200) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Type NVARCHAR(10) NOT NULL,
    TransactionDate DATETIME2 NOT NULL,
    Notes NVARCHAR(1000) NULL,

    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL,

    CONSTRAINT PK_Transactions
        PRIMARY KEY (Id),

    CONSTRAINT FK_Transactions_Accounts_AccountId
        FOREIGN KEY (AccountId)
        REFERENCES Accounts(Id),

    CONSTRAINT FK_Transactions_Categories_CategoryId
        FOREIGN KEY (CategoryId)
        REFERENCES Categories(Id),

    CONSTRAINT FK_Transactions_Users_UserId
        FOREIGN KEY (UserId)
        REFERENCES Users(Id)
);