using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace XTracker.Api.Controllers;

[Authorize]
public abstract class BaseController : ControllerBase
{
    protected int CurrentUserId
    {
        get
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (!int.TryParse(userId, out var id))
            {
                throw new UnauthorizedAccessException(
                    "Authenticated user ID is missing."
                );
            }

            return id;
        }
    }
}