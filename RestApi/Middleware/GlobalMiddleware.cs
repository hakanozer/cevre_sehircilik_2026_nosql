using System.Text;
using System.Text.Json;

public class GlobalMiddleware
{

    private readonly RequestDelegate _next;
    public GlobalMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        Console.WriteLine($"Request from Call");
        await _next(context);
    }

}