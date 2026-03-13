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


            public FileController()
        {

        }

        [HttpPost]
        [Route("UploadMaterial")]
        public JsonResult UploadMaterial([FromBody] object file)
        {
            try
            {
                Console.WriteLine(file.ToString());
                return new JsonResult(true);
            } catch (Exception)
            {
                return new JsonResult(false);
            }
        }

        [HttpGet]
        [Route("TestGet")]
        public JsonResult TestGet()
        {
            try
            {
                return new JsonResult(true);
            } catch (Exception)
            {
                return new JsonResult(false);
            }
        }

    
    }
    
}