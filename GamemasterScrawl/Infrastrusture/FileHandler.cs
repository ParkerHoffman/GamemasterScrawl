using System.ComponentModel.DataAnnotations;
using System.Data.Common;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Microsoft.VisualBasic;

namespace GamemasterScrawl
{
    public class FileHandler<T> where T: new()
    {
        private readonly string filepath;
        private readonly object _lock = new();

        public T Data {get; private set;}

        /// <summary>
        /// This handles reasing and writing of files
        /// </summary>
        /// <param name="basePath"></param>
        /// <param name="fileEnd"></param>
        public FileHandler(string basePath, string fileEnd)
        {
            filepath = Path.Combine(basePath, fileEnd);

            if (File.Exists(filepath))
            {
                var json = File.ReadAllText(filepath);
                Data = JsonSerializer.Deserialize<T>(json) ?? new T();
            } else
            {
                Console.WriteLine(fileEnd + " doesn't exist");
                Data = new T();
                SaveChanges().GetAwaiter().GetResult();
            }
        }

        /// <summary>
        /// This saves changes from the RAM instance to the file
        /// </summary>
        /// <returns></returns>
        public async Task SaveChanges()
        {
            lock (_lock)
            {
                var json = JsonSerializer.Serialize(Data, new JsonSerializerOptions {WriteIndented = true});

                File.WriteAllText(filepath, json);
            }

            await Task.CompletedTask;
        }

    }
}