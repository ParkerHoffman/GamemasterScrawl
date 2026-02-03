using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Cryptography;




namespace GamemasterScrawl
{
    public class SocketHub : Hub
    {

//Used to cleanly shutdown the app when relevant
private readonly IHostApplicationLifetime _appLifetime;
        private readonly FileHandler<LoginState> _store;
        private static int _connectionCount = 0;
        private static readonly object _lock = new();

        private readonly HostIdentity _hostIdentity;


        public SocketHub(FileHandler<LoginState> tempStore, HostIdentity host, IHostApplicationLifetime _lifetime)
        {
            _store = tempStore;
            _hostIdentity = host;
            _appLifetime = _lifetime;
        }


        public override async Task OnConnectedAsync()
        {
            //Increase user count (If/when it reaches 0, terminate app)
            lock (_lock) {_connectionCount ++;}
            
            //Attempt to register as host
            _hostIdentity.RegisterHost(Context.ConnectionId);
        }

        public override async Task OnDisconnectedAsync(Exception? ex)
        {
            bool shouldClear = false;

            lock (_lock)
            {
                _connectionCount --;
                if(_connectionCount == 0 || _hostIdentity.CheckHost(Context.ConnectionId))
                {
                    shouldClear = true;
                }
            }


            //If it's valid to shutdown
            if (shouldClear)
            {
                //CLose windows
                await CloseWindow();

                //Gracefully close the program
                _appLifetime.StopApplication();
            }
        }


        public async Task CloseWindow()
        {
            await Clients.All.SendAsync("CloseWindow");
        }
        

    //This is the function for a user to login
    public async Task UserLogin(string user, string password)
        {
            try
            {
                string passHash = HashString(password);
                           Console.WriteLine(user);
            Console.WriteLine(passHash); 
            
            } catch(Exception ex)
            {
                Console.BackgroundColor = ConsoleColor.DarkRed;
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine(ex.ToString());
                Console.ForegroundColor = ConsoleColor.White;
                Console.BackgroundColor = ConsoleColor.Black;
            }

        }


//This function will hash a user's password using SHA256. Tis hashed password will be utilized for the rest of the program. 
        private string HashString(string? unhashedString)
        {
            //Setting up the SHA instance
                using (var sha = new System.Security.Cryptography.SHA256Managed())
            {
                byte[] textData = System.Text.Encoding.UTF8.GetBytes(unhashedString);
                byte[] hash = sha.ComputeHash(textData);
                return BitConverter.ToString(hash).Replace("-", String.Empty);
            }
       
        }




    }


}