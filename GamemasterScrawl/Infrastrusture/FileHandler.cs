using System.Text.Json;

namespace GamemasterScrawl
{
    public class FileHandler<T>
    {
        private readonly string filepath;

        public FileHandler(string basePath, string fileEnd)
        {
            filepath = Path.Combine(basePath, fileEnd);
        }


        public async Task<T?> LoadAsync()
        {
            if (!File.Exists(filepath))
            {
                return default;
            }


            var json = await File.ReadAllTextAsync(filepath);
            return JsonSerializer.Deserialize<T>(json);
        }

        public async Task SaveChanges(T file)
        {
            var json = JsonSerializer.Serialize(file, new JsonSerializerOptions {WriteIndented = true});

            await File.WriteAllTextAsync(filepath, json);
        }

    }
}