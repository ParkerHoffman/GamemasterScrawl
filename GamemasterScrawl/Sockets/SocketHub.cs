using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;




namespace GamemasterScrawl
{
    public class SocketHub : Hub
    {

        private readonly FileHandler<LoginState> _store;
        private static int _connectionCount = 0;
        private static readonly object _lock = new();


        public SocketHub(FileHandler<LoginState> tempStore)
        {
            _store = tempStore;
        }


        public override async Task OnConnectedAsync()
        {
            lock (_lock) {_connectionCount ++;}
        }

        public override async Task OnDisconnectedAsync(Exception? ex)
        {
            bool shouldClear = false;

            lock (_lock)
            {
                _connectionCount --;
                if(_connectionCount == 0)
                {
                    shouldClear = true;
                }
            }


            if (shouldClear)
            {
                //Any shutdown logic goes here
            }
        }
        

    //This is where the other functions go



    }


}