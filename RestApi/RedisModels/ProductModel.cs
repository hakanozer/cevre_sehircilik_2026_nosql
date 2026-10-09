// redis için ProductModel adında bir model, içinde id-> int, name-> string, price-> decimal alanları var.
namespace RestApi
{
    
    public sealed record ProductModel
    (
        int Id,
        string Name,
        decimal Price
    );

}