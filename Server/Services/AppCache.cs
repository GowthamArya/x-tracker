using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;

namespace XTracker.Api.Services;

public sealed class AppCache
{
    private readonly IMemoryCache cache;
    private readonly ConcurrentDictionary<int, long> versions = new();

    public AppCache(IMemoryCache cache)
    {
        this.cache = cache;
    }

    public string Key(int userId, string resource, string? scope = null)
    {
        var version = versions.GetOrAdd(userId, 1);
        return $"app:{userId}:v{version}:{resource}:{scope ?? "all"}";
    }

    public Task<T?> GetOrCreateAsync<T>(string key, Func<ICacheEntry, Task<T>> factory, TimeSpan lifetime)
    {
        return cache.GetOrCreateAsync(key, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = lifetime;
            entry.Size = 1;
            return factory(entry);
        });
    }

    public void InvalidateUser(int userId)
    {
        versions.AddOrUpdate(userId, 2, (_, version) => version == long.MaxValue ? 1 : version + 1);
    }
}
