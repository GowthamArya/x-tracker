using Microsoft.EntityFrameworkCore;
using XTracker.Api.Models;

namespace XTracker.Api.Data;

public class XTrackerDbContext : DbContext
{
    public XTrackerDbContext(
        DbContextOptions<XTrackerDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<AccountMember> AccountMembers => Set<AccountMember>();
    public DbSet<AccountInvite> AccountInvites => Set<AccountInvite>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Trip> Trips => Set<Trip>();

    public DbSet<TripMember> TripMembers => Set<TripMember>();

    public DbSet<TripExpense> TripExpenses => Set<TripExpense>();

    public DbSet<TripExpenseParticipant> TripExpenseParticipants => Set<TripExpenseParticipant>();

    public DbSet<TripInvite> TripInvites => Set<TripInvite>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.User)
            .WithMany(u => u.Transactions)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<AccountMember>()
            .HasOne(m => m.Account).WithMany(a => a.Members)
            .HasForeignKey(m => m.AccountId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AccountMember>()
            .HasOne(m => m.User).WithMany(u => u.AccountMemberships)
            .HasForeignKey(m => m.UserId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<AccountMember>()
            .HasIndex(m => new { m.AccountId, m.UserId }).IsUnique();

        modelBuilder.Entity<AccountInvite>()
            .HasOne(i => i.Account).WithMany()
            .HasForeignKey(i => i.AccountId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.Account)
            .WithMany(a => a.Transactions)
            .HasForeignKey(t => t.AccountId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.Category)
            .WithMany(c => c.Transactions)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<User>()
            .HasIndex(x => x.GoogleId)
            .IsUnique();

        modelBuilder.Entity<Trip>()
            .HasMany(t => t.Members)
            .WithOne(m => m.Trip)
            .HasForeignKey(m => m.TripId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Trip>()
            .HasMany(t => t.Expenses)
            .WithOne(e => e.Trip)
            .HasForeignKey(e => e.TripId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Trip>()
            .HasMany(t => t.Invites)
            .WithOne(i => i.Trip)
            .HasForeignKey(i => i.TripId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TripMember>()
            .HasIndex(tm => new { tm.TripId, tm.UserId })
            .IsUnique();

        modelBuilder.Entity<TripExpense>()
            .HasOne(e => e.PaidBy)
            .WithMany()
            .HasForeignKey(e => e.PaidByTripMemberId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TripExpenseParticipant>()
            .HasOne(p => p.TripExpense)
            .WithMany(e => e.Participants)
            .HasForeignKey(p => p.TripExpenseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TripExpenseParticipant>()
            .HasOne(p => p.TripMember)
            .WithMany()
            .HasForeignKey(p => p.TripMemberId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TripExpenseParticipant>()
            .Property(x => x.ShareAmount)
            .HasPrecision(18, 2);
    }
}
