using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;




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


            if (shouldClear)
            {
                //Gracefully close the program
                _appLifetime.StopApplication();
            }
        }
        

    //This is where the other functions go



    }


}