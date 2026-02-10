using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Cryptography;
using System.Reflection.Metadata;




namespace GamemasterScrawl
{
    public class SocketHub : Hub
    {

//Used to cleanly shutdown the app when relevant
private readonly IHostApplicationLifetime _appLifetime;
        private readonly FileHandler<LoginState> _loginStore;
        private static int _connectionCount = 0;
        private static readonly object _lock = new();

        private readonly HostIdentity _hostIdentity;

        /// <summary>
        /// The constructor for a SocketHub
        /// </summary>
        /// <param name="tempStore">Login Details File (FileHandler<LoginState>)</param>
        /// <param name="host">Reference to the HostIdentity class</param>
        /// <param name="_lifetime">Application reference, for termination</param>
        public SocketHub(FileHandler<LoginState> tempStore, HostIdentity host, IHostApplicationLifetime _lifetime)
        {
            _loginStore = tempStore;
            _hostIdentity = host;
            _appLifetime = _lifetime;
        }

        /// <summary>
        /// This is the function that handles when a connection is established and registering the user, incrementing the user count, etc...
        /// </summary>
        /// <returns>Nothing</returns>
        public override async Task OnConnectedAsync()
        {
            //Increase user count (If/when it reaches 0, terminate app)
            lock (_lock) {_connectionCount ++;}
            
            //Attempt to register as host
            _hostIdentity.RegisterHost(Context.ConnectionId);
        }

/// <summary>
/// This function runs when a user disconnects. It handles possibly shutting down the app and various other functions
/// </summary>
/// <param name="ex">Closing Exception</param>
/// <returns>Nothing</returns>
        public override async Task OnDisconnectedAsync(Exception? ex)
        {
            if(ex != null)
            {
                Console.WriteLine(ex.Message);
            }
            
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
                await CloseWindows();

                //Gracefully close the program
                _appLifetime.StopApplication();
            }
        }


        /// <summary>
        /// This function intializes the shutdown process for the clients
        /// </summary>
        /// <returns>Nothing</returns>
        public async Task CloseWindows()
        {
            await Clients.All.SendAsync("CloseWindow");
        }
        

        /// <summary>
        /// This returns a bool representing if the user is the host
        /// </summary>
        /// <returns>Bool, true if user is host, false otherwise</returns>
        public async Task<bool> CheckIfHost()
        {
            return _hostIdentity.CheckHost(Context.ConnectionId);
        }


        /// <summary>
        /// This gets a list of currently useful users
        /// </summary>
        /// <returns>A string[] of current usernames that are valid</returns>
        public async Task<string[]> GetUserNameList()
        {
            List<string> uList = new List<string>();
            
            foreach(GamemasterScrawl.User singleUser in _loginStore.Data.users)
            {
                uList.Add(singleUser.username);
            }

            return uList.ToArray();

        }

        public async Task<User[]> GetFullUserList()
        {
            return _loginStore.Data.users;
        }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="user"></param>
    /// <param name="password"></param>
    /// <returns></returns>
    public async Task UserLogin(string user, string password)
        {
            try
            {
                string passHash = HashString(password);
            
            } catch(Exception ex)
            {
                //In the event of an error, make it obvious
                Console.BackgroundColor = ConsoleColor.DarkRed;
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine(ex.ToString());
                Console.ForegroundColor = ConsoleColor.White;
                Console.BackgroundColor = ConsoleColor.Black;
            }

        }


        /// <summary>
        /// This function will return a hashed version of the input string
        /// </summary>
        /// <param name="unhashedString">This is the sting before it's hashed</param>
        /// <returns>The hashed version of the above string</returns>
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