using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace RestApi.Models
{
    [Index(nameof(Username), IsUnique = true)]
    public class User
    {
        [Key]
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}