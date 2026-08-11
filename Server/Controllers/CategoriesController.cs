using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;
using XTracker.Api.DTOs;
using XTracker.Api.Models;

namespace XTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : BaseController
{
    private readonly XTrackerDbContext _context;

    public CategoriesController(XTrackerDbContext context)
    {
        _context = context;
    }

    // GET: api/Categories
    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories(
        [FromQuery] int? userId,
        [FromQuery] string? type)
    {
        var currentUserId = CurrentUserId;

        var categoriesQuery = _context.Categories
            .AsNoTracking()
            .Where(x => x.UserId == 1 || x.UserId == currentUserId);

        if (type is not null)
        {
            categoriesQuery = categoriesQuery.Where(
                x => x.Type == type);
        }

        var categories = await categoriesQuery
            .OrderBy(x => x.Type)
            .ThenBy(x => x.Name)
            .Select(x => new CategoryDto
            {
                Id = x.Id,
                UserId = x.UserId,
                Name = x.Name,
                Type = x.Type,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();

        return Ok(categories);
    }

    // GET: api/Categories/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(int id)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new CategoryDto
            {
                Id = x.Id,
                UserId = x.UserId,
                Name = x.Name,
                Type = x.Type,
                CreatedAt = x.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (category is null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    // POST: api/Categories
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory(
        CategoryRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Category name is required.");
        }

        if (request.Type != "income" &&
            request.Type != "expense")
        {
            return BadRequest(
                "Category type must be income or expense."
            );
        }

        var userId = CurrentUserId;

        var name = request.Name.Trim();

        var categoryExists = await _context.Categories
            .AnyAsync(x =>
                x.UserId == userId &&
                x.Name == name &&
                x.Type == request.Type);

        if (categoryExists)
        {
            return Conflict(
                "A category with this name already exists."
            );
        }

        var category = new Category
        {
            UserId = userId,
            Name = name,
            Type = request.Type,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetCategory),
            new { id = category.Id },
            await GetCategoryDto(category.Id)
        );
    }

    // PUT: api/Categories/1
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(
        int id,
        CategoryRequestDto request)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(
                x => x.Id == id &&
                     x.UserId == CurrentUserId);

        if (category is null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Category name is required.");
        }

        if (request.Type != "income" &&
            request.Type != "expense")
        {
            return BadRequest(
                "Category type must be income or expense."
            );
        }

        var name = request.Name.Trim();

        var duplicate = await _context.Categories
            .AnyAsync(x =>
                x.Id != id &&
                x.UserId == CurrentUserId &&
                x.Name == name &&
                x.Type == request.Type);

        if (duplicate)
        {
            return Conflict(
                "A category with this name already exists."
            );
        }

        category.UserId = CurrentUserId;
        category.Name = name;
        category.Type = request.Type;

        await _context.SaveChangesAsync();

        return Ok(
            await GetCategoryDto(category.Id)
        );
    }

    // DELETE: api/Categories/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(x => x.Id == id);

        if (category is null)
        {
            return NotFound();
        }

        var hasTransactions = await _context.Transactions
            .AnyAsync(x => x.CategoryId == id);

        if (hasTransactions)
        {
            return Conflict(
                "Cannot delete a category that has transactions."
            );
        }

        _context.Categories.Remove(category);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<CategoryDto?> GetCategoryDto(int id)
    {
        return await _context.Categories
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new CategoryDto
            {
                Id = x.Id,
                UserId = x.UserId,
                Name = x.Name,
                Type = x.Type,
                CreatedAt = x.CreatedAt
            })
            .FirstOrDefaultAsync();
    }
}