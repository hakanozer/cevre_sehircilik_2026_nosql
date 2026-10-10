using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualBasic;
using RestApi.Data;
using RestApi.Models;
using RestApi.Models.Dto;
using RestApi.Services;
using StackExchange.Redis;
using System;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;

namespace RestApi.Controllers
{
    [EnableCors("_myAllowSpecificOrigins")]
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        string name = "";
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ITokenRevocationService revocations;

        public AuthController(ApplicationDbContext context, IConfiguration configuration, ITokenRevocationService revocations)
        {
            _configuration = configuration;
            _context = context;
            this.revocations = revocations;
        }
        

        [HttpPost("register")]
        public IActionResult Register(User user)
        {
            if (ModelState.IsValid == false)
            {
                return BadRequest(ModelState);
            }
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok(user);
        }

        [HttpPost("loginUser")]
        public IActionResult LoginUser(UserLoginDto userDto)
        {
            //string query = "SELECT * FROM Users WHERE Username = '"+userDto.Username+"' AND Password = '"+userDto.Password+"'";
            string query = "SELECT * FROM Users WHERE Username = {0} AND Password = {1}";
            Console.WriteLine("Query: " + query);
            var userDb = _context.Users.FromSqlRaw(query, userDto.Username, userDto.Password).FirstOrDefault();
            //var userDb = _context.Users.FromSqlRaw(query).FirstOrDefault();
            if (userDb == null)
            {
                return Unauthorized("Invalid username or password");
            }
            return Ok(userDb);
        }

        [HttpPost("login")]
        public IActionResult Login(UserLoginDto userDto)
        {
            if (ModelState.IsValid == false)
            {
                return BadRequest(ModelState);
            }
            var user = new User
            {
                Username = userDto.Username,
                Password = userDto.Password
            };
            // Encrypt the password
            string passwordHash1 = BCrypt.Net.BCrypt.HashPassword(user.Password);
            Console.WriteLine("Hashed Password: " + passwordHash1);

            var EncDecKey = _configuration.GetValue<string>("EncDecKey") ?? "";
            PasswordManager passwordManager = new(EncDecKey);
            string newPass = passwordManager.Encrypt(user.Password);
            Console.WriteLine("Encrypted Password: " + newPass);

            string decryptedPass = passwordManager.Decrypt(newPass);
            Console.WriteLine("Decrypted Password: " + decryptedPass);

            var existingUser = _context.Users.FirstOrDefault(u => u.Username == user.Username);
            if (existingUser != null)
            {
                // Check if the password is correct
                if (BCrypt.Net.BCrypt.Verify(user.Password, existingUser.Password))
                {
                    Console.WriteLine("Password is correct");
                }
                else
                {
                    return Unauthorized("Invalid password");
                }
            }
            else
            {
                return NotFound("User not found");
            }

            // Generate JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var JwtKey = _configuration.GetValue<string>("Jwt:Key") ?? "";
            var key = Encoding.ASCII.GetBytes(JwtKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, existingUser.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.Name, existingUser.Username)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            if (tokenDescriptor != null)
            {
                ParseRole(existingUser.Role, tokenDescriptor);
            }

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);
            var parsedToken = tokenHandler.ReadJwtToken(tokenString);
            Console.WriteLine(
                $"JWT jti: {parsedToken.Claims
                    .FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value}"
            );
            existingUser.Password = null; // Remove password from the response
            return Ok(new { Token = tokenString, User = existingUser });
        }

        private void ParseRole(string roles, SecurityTokenDescriptor tokenDescriptor)
        {
            var roleList = roles.Split(',').Select(r => r.Trim()).ToList();
            foreach (var role in roleList)
            {
                tokenDescriptor.Subject.AddClaim(new Claim(ClaimTypes.Role, role));
            }
        }


            [HttpPost("logout")]
            public async Task<IActionResult> Logout()
            {
                if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
                    || userId <= 0)
                    return Unauthorized();
                var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
                var exp = User.FindFirst(JwtRegisteredClaimNames.Exp)?.Value;
                if (string.IsNullOrWhiteSpace(jti)
                    || !long.TryParse(exp, NumberStyles.Integer,
                        CultureInfo.InvariantCulture, out var seconds))
                    return Unauthorized();

                try
                {
                    await revocations.RevokeAsync(
                        jti, DateTimeOffset.FromUnixTimeSeconds(seconds).UtcDateTime);
                    return NoContent();
                }
                catch (RedisException)
                {
                    return StatusCode(503, new ProblemDetails
                    {
                        Status = 503, Title = "Token revocation store unavailable."
                    });
                }
            }

    }
}