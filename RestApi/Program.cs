
using Microsoft.EntityFrameworkCore;
using RestApi.Data;
using RestApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Text;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// Redis bağlantısı
var redisSection = builder.Configuration.GetSection("Redis");
var redisServiceName = redisSection["ServiceName"]
    ?? throw new InvalidOperationException(
        "Redis:ServiceName configuration is missing.");
var redisSentinels = redisSection.GetSection("Sentinels")
    .Get<string[]>()
    ?? throw new InvalidOperationException(
        "Redis:Sentinels configuration is missing.");
if (redisSentinels.Length == 0)
{
    throw new InvalidOperationException(
        "Redis:Sentinels must contain at least one endpoint.");
}

// OpenTelemetry ile trace ve metrik:
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()
        .AddRedisInstrumentation())      // OpenTelemetry.Instrumentation.StackExchangeRedis
    .WithMetrics(m => m
        .AddAspNetCoreInstrumentation()
        .AddPrometheusExporter());       // veya OTLP ile collector'a        

builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
{
    var options = new ConfigurationOptions
    {
        ServiceName = redisServiceName,
        AbortOnConnectFail = false,
        ConnectRetry = 3,
        ConnectTimeout = 5000,
        SyncTimeout = 5000,
        AsyncTimeout = 5000
    };

    foreach (var sentinel in redisSentinels)
    {
        options.EndPoints.Add(sentinel);
    }
    var sentinelConnection = ConnectionMultiplexer.SentinelConnect(options);
    return sentinelConnection.GetSentinelMasterConnection(options);
});

// Servisler
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IRateLimitService, RateLimitService>();
builder.Services.AddScoped<ITokenRevocationService, TokenRevocationService>();

builder.Services.AddControllers();
builder.Services.AddAuthorization();

// CORS
const string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(MyAllowSpecificOrigins, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5120",
                "https://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "Jwt:Key configuration is missing.");

var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = true;
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine(
                    $"JWT authentication failed: {context.Exception}"
                );

                return Task.CompletedTask;
            },

            OnChallenge = context =>
            {
                Console.WriteLine(
                    $"JWT challenge: {context.Error} - {context.ErrorDescription}"
                );

                return Task.CompletedTask;
            },

            OnTokenValidated = async context =>
            {
                var jti = context.Principal?
                    .FindFirst(
                        System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Jti
                    )?.Value;

                if (string.IsNullOrWhiteSpace(jti))
                {
                    context.Fail("Required token identifier is missing.");
                    return;
                }

                var service = context.HttpContext.RequestServices
                    .GetRequiredService<ITokenRevocationService>();

                try
                {
                    if (await service.IsRevokedAsync(jti))
                    {
                        context.Fail("Token has been revoked.");
                    }
                }
                catch (RedisException ex)
                {
                    Console.WriteLine(
                        $"Token revocation service is unavailable: {ex.Message}"
                    );

                    context.Fail("Token revocation service is unavailable.");
                }
            }
        };
        
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

var app = builder.Build();
app.MapPrometheusScrapingEndpoint();   // varsayılan: /metrics

// HTTPS
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();

// CORS
app.UseCors(MyAllowSpecificOrigins);

// Hata yönetimi
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseMiddleware<ErrorHandlerMiddleware>();
app.UseMiddleware<GlobalMiddleware>();

// Authentication -> Rate Limiting -> Authorization
app.UseAuthentication();

app.UseMiddleware<GlobalRateLimitMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();