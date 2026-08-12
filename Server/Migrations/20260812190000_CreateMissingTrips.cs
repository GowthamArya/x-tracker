using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    public partial class CreateMissingTrips : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create Trips table if missing
            migrationBuilder.Sql(@"
IF OBJECT_ID('Trips') IS NULL
BEGIN
    CREATE TABLE [Trips](
        [Id] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Name] nvarchar(200) NOT NULL,
        [Description] nvarchar(1000) NULL,
        [StartDate] datetime2 NULL,
        [EndDate] datetime2 NULL,
        [CreatedByUserId] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [IsActive] bit NOT NULL
    );
END
");

            // Create TripMembers
            migrationBuilder.Sql(@"
IF OBJECT_ID('TripMembers') IS NULL
BEGIN
    CREATE TABLE [TripMembers](
        [Id] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [TripId] int NOT NULL,
        [UserId] int NULL,
        [Name] nvarchar(200) NOT NULL,
        [Email] nvarchar(255) NULL,
        [JoinedAt] datetime2 NOT NULL,
        [IsOwner] bit NOT NULL
    );
    IF NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.objects o ON i.object_id = o.object_id WHERE i.name = 'IX_TripMembers_TripId' AND o.name = 'TripMembers')
        CREATE INDEX IX_TripMembers_TripId ON TripMembers (TripId);
END
");

            // Create TripExpenses
            migrationBuilder.Sql(@"
IF OBJECT_ID('TripExpenses') IS NULL
BEGIN
    CREATE TABLE [TripExpenses](
        [Id] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [TripId] int NOT NULL,
        [CategoryId] int NULL,
        [PaidByTripMemberId] int NOT NULL,
        [AddedByUserId] int NOT NULL,
        [Description] nvarchar(200) NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [ExpenseDate] datetime2 NOT NULL,
        [Notes] nvarchar(1000) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL
    );
    IF NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.objects o ON i.object_id = o.object_id WHERE i.name = 'IX_TripExpenses_TripId' AND o.name = 'TripExpenses')
        CREATE INDEX IX_TripExpenses_TripId ON TripExpenses (TripId);
END
");

            // Create TripExpenseParticipants
            migrationBuilder.Sql(@"
IF OBJECT_ID('TripExpenseParticipants') IS NULL
BEGIN
    CREATE TABLE [TripExpenseParticipants](
        [Id] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [TripExpenseId] int NOT NULL,
        [TripMemberId] int NOT NULL,
        [ShareAmount] decimal(18,2) NULL
    );
    IF NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.objects o ON i.object_id = o.object_id WHERE i.name = 'IX_TripExpenseParticipants_TripExpenseId' AND o.name = 'TripExpenseParticipants')
        CREATE INDEX IX_TripExpenseParticipants_TripExpenseId ON TripExpenseParticipants (TripExpenseId);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.objects o ON i.object_id = o.object_id WHERE i.name = 'IX_TripExpenseParticipants_TripMemberId' AND o.name = 'TripExpenseParticipants')
        CREATE INDEX IX_TripExpenseParticipants_TripMemberId ON TripExpenseParticipants (TripMemberId);
END
");

            // Create TripInvites
            migrationBuilder.Sql(@"
IF OBJECT_ID('TripInvites') IS NULL
BEGIN
    CREATE TABLE [TripInvites](
        [Id] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [TripId] int NOT NULL,
        [Token] nvarchar(128) NOT NULL,
        [CreatedByUserId] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [ExpiresAt] datetime2 NULL,
        [IsActive] bit NOT NULL
    );
    IF NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.objects o ON i.object_id = o.object_id WHERE i.name = 'IX_TripInvites_TripId' AND o.name = 'TripInvites')
        CREATE INDEX IX_TripInvites_TripId ON TripInvites (TripId);
END
");

            // Add FK constraints if referenced tables exist
            migrationBuilder.Sql(@"
IF OBJECT_ID('TripExpenses') IS NOT NULL AND OBJECT_ID('TripMembers') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys fk WHERE fk.name = 'FK_TripExpenses_TripMembers_PaidByTripMemberId')
BEGIN
    ALTER TABLE TripExpenses ADD CONSTRAINT FK_TripExpenses_TripMembers_PaidByTripMemberId FOREIGN KEY (PaidByTripMemberId) REFERENCES TripMembers(Id) ON DELETE NO ACTION;
END
");

            migrationBuilder.Sql(@"
IF OBJECT_ID('TripMembers') IS NOT NULL AND OBJECT_ID('Trips') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys fk WHERE fk.name = 'FK_TripMembers_Trips_TripId')
BEGIN
    ALTER TABLE TripMembers ADD CONSTRAINT FK_TripMembers_Trips_TripId FOREIGN KEY (TripId) REFERENCES Trips(Id) ON DELETE CASCADE;
END
");

            migrationBuilder.Sql(@"
IF OBJECT_ID('TripExpenses') IS NOT NULL AND OBJECT_ID('Trips') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys fk WHERE fk.name = 'FK_TripExpenses_Trips_TripId')
BEGIN
    ALTER TABLE TripExpenses ADD CONSTRAINT FK_TripExpenses_Trips_TripId FOREIGN KEY (TripId) REFERENCES Trips(Id) ON DELETE CASCADE;
END
");

            migrationBuilder.Sql(@"
IF OBJECT_ID('TripExpenseParticipants') IS NOT NULL AND OBJECT_ID('TripExpenses') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys fk WHERE fk.name = 'FK_TripExpenseParticipants_TripExpenses_TripExpenseId')
BEGIN
    ALTER TABLE TripExpenseParticipants ADD CONSTRAINT FK_TripExpenseParticipants_TripExpenses_TripExpenseId FOREIGN KEY (TripExpenseId) REFERENCES TripExpenses(Id) ON DELETE CASCADE;
END
");

            migrationBuilder.Sql(@"
IF OBJECT_ID('TripExpenseParticipants') IS NOT NULL AND OBJECT_ID('TripMembers') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys fk WHERE fk.name = 'FK_TripExpenseParticipants_TripMembers_TripMemberId')
BEGIN
    ALTER TABLE TripExpenseParticipants ADD CONSTRAINT FK_TripExpenseParticipants_TripMembers_TripMemberId FOREIGN KEY (TripMemberId) REFERENCES TripMembers(Id) ON DELETE NO ACTION;
END
");

            migrationBuilder.Sql(@"
IF OBJECT_ID('TripInvites') IS NOT NULL AND OBJECT_ID('Trips') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys fk WHERE fk.name = 'FK_TripInvites_Trips_TripId')
BEGIN
    ALTER TABLE TripInvites ADD CONSTRAINT FK_TripInvites_Trips_TripId FOREIGN KEY (TripId) REFERENCES Trips(Id) ON DELETE CASCADE;
END
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No-op: do not drop tables in Down to avoid data loss in case they already existed
        }
    }
}
