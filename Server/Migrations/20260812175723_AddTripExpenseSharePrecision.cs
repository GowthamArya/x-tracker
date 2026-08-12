using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddTripExpenseSharePrecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
                // Drop existing index if it exists to avoid errors on databases where it was never created
                migrationBuilder.Sql(@"IF EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.objects o ON i.object_id = o.object_id WHERE i.name = 'IX_TripMembers_TripId' AND o.name = 'TripMembers')
            DROP INDEX IX_TripMembers_TripId ON TripMembers;");

                // Create unique filtered index on TripMembers if table exists
                migrationBuilder.Sql(@"IF OBJECT_ID('TripMembers') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.objects o ON i.object_id = o.object_id WHERE i.name = 'IX_TripMembers_TripId_UserId' AND o.name = 'TripMembers')
            CREATE UNIQUE INDEX IX_TripMembers_TripId_UserId ON TripMembers (TripId, UserId) WHERE [UserId] IS NOT NULL;");

                // Create index on TripExpenses if table exists
                migrationBuilder.Sql(@"IF OBJECT_ID('TripExpenses') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.objects o ON i.object_id = o.object_id WHERE i.name = 'IX_TripExpenses_PaidByTripMemberId' AND o.name = 'TripExpenses')
            CREATE INDEX IX_TripExpenses_PaidByTripMemberId ON TripExpenses (PaidByTripMemberId);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
                // Drop indexes if they exist
                migrationBuilder.Sql(@"IF OBJECT_ID('TripMembers') IS NOT NULL AND EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.objects o ON i.object_id = o.object_id WHERE i.name = 'IX_TripMembers_TripId_UserId' AND o.name = 'TripMembers')
            DROP INDEX IX_TripMembers_TripId_UserId ON TripMembers;");

                migrationBuilder.Sql(@"IF OBJECT_ID('TripExpenses') IS NOT NULL AND EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.objects o ON i.object_id = o.object_id WHERE i.name = 'IX_TripExpenses_PaidByTripMemberId' AND o.name = 'TripExpenses')
            DROP INDEX IX_TripExpenses_PaidByTripMemberId ON TripExpenses;");

                // Recreate previous TripMembers index if table exists
                migrationBuilder.Sql(@"IF OBJECT_ID('TripMembers') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.objects o ON i.object_id = o.object_id WHERE i.name = 'IX_TripMembers_TripId' AND o.name = 'TripMembers')
            CREATE INDEX IX_TripMembers_TripId ON TripMembers (TripId);");
        }
    }
}
