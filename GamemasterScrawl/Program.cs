using System.Diagnostics;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;


var builder = WebApplication.CreateBuilder(args);


builder.WebHost.ConfigureKestrel(options =>
{

    options.ListenAnyIP(80);
    options.ListenAnyIP(443, listenOptions =>
    {
        listenOptions.UseHttps();
    });
});

var app = builder.Build();


var lifetime = app.Lifetime;

lifetime.ApplicationStarted.Register(() =>
{
    try
    {

string? ip = null;

        foreach (var ni in NetworkInterface.GetAllNetworkInterfaces())
    {
        if (ni.OperationalStatus != OperationalStatus.Up)
            continue;

        var ipProps = ni.GetIPProperties();

        foreach (var addr in ipProps.UnicastAddresses)
        {
            if (addr.Address.AddressFamily == AddressFamily.InterNetwork &&
                !IPAddress.IsLoopback(addr.Address))
            {
                ip =  addr.Address.ToString();
            }
        }
    }
        

        var url = ip != null
            ? $"http://{ip}"
            : "https://localhost";

        Process.Start(new ProcessStartInfo
        {
            FileName = url,
            UseShellExecute = true
        });
    }
    catch
    {
        // Swallow exceptions to avoid crashing the app if browser launch fails
    }
});


app.MapGet("/", () => "Server is running. Is your Refridgerator?");

app.Run("http://0.0.0.0:5000");
