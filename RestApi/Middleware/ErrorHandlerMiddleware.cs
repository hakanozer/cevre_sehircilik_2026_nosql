public class ErrorHandlerMiddleware
{
    private readonly RequestDelegate _next;
    public ErrorHandlerMiddleware(RequestDelegate next)
    {
        _next = next;
    }
    public async Task Invoke(HttpContext context)
    {
        var username = context.User.Identity?.Name ?? "Anonymous";
        Console.WriteLine($"Username {username}");
        var ip = context.Connection.RemoteIpAddress.ToString();
        //var sessionId = context.Session.Id;
        var headers = context.Request.Headers;
        //Console.WriteLine($"Session {sessionId}");
        Console.WriteLine($"Request from {ip}");
        Console.WriteLine($"Request Path: {context.Request.Path}");
        Console.WriteLine($"Request Method: {context.Request.Method}");
        foreach (var header in headers)
        {
            Console.WriteLine($"{header.Key}: {header.Value}");
        }
        try
        {
            await _next(context);
        }
        catch (Exception error)
        {
            var response = context.Response;
            response.StatusCode = error switch
            {
                UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
                KeyNotFoundException => StatusCodes.Status404NotFound,
                ArgumentException => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status500InternalServerError
            };
            response.ContentType = "application/json";
            var result = System.Text.Json.JsonSerializer.Serialize(new
            {
                status = false,
                error = error.Message
            });
            await response.WriteAsync(result);
        }
    }
}