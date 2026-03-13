using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Text;



namespace GamemasterScrawl.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
        public class FileController : ControllerBase
    {


            private readonly IWebHostEnvironment _env;

public FileController(IWebHostEnvironment env)
{
    _env = env;
}

        [HttpPost]
        [Route("UploadMaterial")]
        public JsonResult UploadMaterial([FromForm] IFormFile file)
        {
            try
            {

                using var stream = file.OpenReadStream();


                var hash = System.Security.Cryptography.SHA256.HashData(stream);
                var hashString = Convert.ToHexString(hash).ToLower();

                var extension = Path.GetExtension(file.FileName);
                var uniqueName = $"{hashString}{extension}";


                var savePath = Path.Combine(_env.WebRootPath, "Components", "FileMaterials", "Materials", uniqueName);
                
                stream.Position = 0;

                using var outStream = System.IO.File.Create(savePath);
                stream.CopyTo(outStream);



                return new JsonResult(true);
            } catch (Exception)
            {
                return new JsonResult(false);
            }
        }

        [HttpPost]
        [Route("UploadToken")]
        public JsonResult UploadToken([FromForm] IFormFile file)
        {
            try
            {

                using var stream = file.OpenReadStream();


                var hash = System.Security.Cryptography.SHA256.HashData(stream);
                var hashString = Convert.ToHexString(hash).ToLower();

                var extension = Path.GetExtension(file.FileName);
                var uniqueName = $"{hashString}{extension}";


                var savePath = Path.Combine(_env.WebRootPath, "Components", "FileMaterials", "TokenImages", uniqueName);
                
                stream.Position = 0;

                using var outStream = System.IO.File.Create(savePath);
                stream.CopyTo(outStream);



                return new JsonResult(true);
            } catch (Exception)
            {
                return new JsonResult(false);
            }
        }

    
    }
    
}