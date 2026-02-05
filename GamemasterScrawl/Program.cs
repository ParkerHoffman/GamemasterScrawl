using System.Diagnostics;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using GamemasterScrawl;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.SignalR;



//Building the server host
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();

//Manages who the host is, and services related to that
builder.Services.AddSingleton<HostIdentity>();

//Registering the various data files
builder.Services.AddSingleton(sp =>
{
    //Setting up the root directory path
    var env = sp.GetRequiredService<IWebHostEnvironment>();
    var dataPath = Path.Combine(env.ContentRootPath, "App_Data");
    Directory.CreateDirectory(dataPath);


    //User info
    return new FileHandler<LoginState>(dataPath, "login.json");
});


//Configuring the ports to use
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(80);
    options.ListenAnyIP(443, listenOptions =>
    {
        listenOptions.UseHttps();
    });
});


//Building the actual app
var app = builder.Build();

//Used in routing for the app, if not otherwise specified the app knows where the correct files are when http requesting
app.UseStaticFiles();

//Used in determining the useable IP (for the auto-open of it)
var lifetime = app.Lifetime;


//On the app running, do the lambda
lifetime.ApplicationStarted.Register(() =>
{
    try
    {

//Declare the IP (It starts null, can become not null)
string? ip = null;

//Check all network interface for usefulness
        foreach (var ni in NetworkInterface.GetAllNetworkInterfaces())
    {
        //If the interface is not up, leave
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

lifetime.ApplicationStopping.Register(() =>
{
    Console.WriteLine("Application stopping — cleaning up...");

    //Setting up to tell all Socket clients to DC
    var hubContext = app.Services.GetRequiredService<Microsoft.AspNetCore.SignalR.IHubContext<SocketHub>>();

    //Telling all socket clients to DC
    hubContext.Clients.All.SendAsync("CloseWindow").GetAwaiter().GetResult();
    // Save files, flush state, etc.
});

//Sets the default path to 'login.html' to enforce logging in first. 
app.MapGet("/", async context =>
{
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(
        Path.Combine(app.Environment.WebRootPath, "login.html")
    );
});
app.MapHub<SocketHub>("/socketHub");

app.Run("http://0.0.0.0:5000");
