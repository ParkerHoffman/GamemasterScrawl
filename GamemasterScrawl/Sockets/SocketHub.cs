using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Cryptography;
using System.Reflection.Metadata;
using System.ComponentModel;




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
                } else
                {
                    List<User> tempList = new List<User>();

                    foreach(User u in _loginStore.Data.users)
                    {
                        if (u.currentConnection.Equals(Context.ConnectionId))
                        {
                            u.currentConnection = "";
                        }

                        tempList.Add(u);
                    }

                    _loginStore.Data.users = tempList.ToArray();

                    _loginStore.SaveChanges();
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


            //clear all the connections (for use next time)
            List<User> tempList = new List<User>();

            foreach(User u in _loginStore.Data.users)
            {
                u.currentConnection = "";
                tempList.Add(u);
            }

            _loginStore.Data.users = tempList.ToArray();

            //Save the current filestate
            _loginStore.SaveChanges();


            //Tell all the users to close run their disconnect functions
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
            //Temporary list to eb sorted through
            List<string> tempList = new List<string>();

            //Iterate through every user in the list
            foreach(User u in _loginStore.Data.users)
            {
                //If there is not a connected user
                if(u.currentConnection != null && u.currentConnection.Length == 0)
                {
                    //Add the username
                    tempList.Add(u.username);
                }
            }

            //Return the array of usernames
            return tempList.ToArray();

        }


        /// <summary>
        /// This gives a master view of the Userlist data for editng purposes
        /// </summary>
        /// <returns>The JSON of the User Data</returns>
        public async Task<User[]> GetFullUserList()
        {
            bool? perms = await CheckIfHost();
            //Check the perms of the user. Deny if not allowed
            if(perms != true)
            {
                return [];
            }

            return _loginStore.Data.users;
        }

    /// <summary>
    /// This function handles the login process of the app
    /// </summary>
    /// <param name="user">username selected</param>
    /// <param name="password">Hashed password from client</param>
    /// <returns>Bool of success</returns>
    public async Task<bool> UserLogin(string username, string password)
        {
            try
            {
                string passHash = HashString(password);

                GamemasterScrawl.User? user = null;

                //Declare the holding variable for event user can be signed in
                int holdingI;

                for(holdingI = 0; holdingI < _loginStore.Data.users.Length; holdingI++)
                {
                    GamemasterScrawl.User u = _loginStore.Data.users[holdingI];


                    //Check every account
                    //If a user is not connected to this account AND the credentials are correct
                    if (u.username.Equals(username) && u.checkLoginAbility(passHash))
                    {
                        //Set the user
                        user = u;

                        //Stop iterating
                        break;
                    }
                }

                //Case: No user identified
                if(user == null)
                {
                    //Tell the user those creds don't work (or another user is using them)
                    return false;
                }

                //log that this user is verified
                user.currentConnection = Context.ConnectionId;

                User[] tempArray = _loginStore.Data.users;
                tempArray[holdingI] = user;

                _loginStore.Data.users = tempArray;

                _loginStore.SaveChanges();

                //Now, we tell all clients this user is signed in
                await Clients.All.SendAsync("UserSuccessfullyLoggedIn", username);

                return true;
            
            } catch(Exception ex)
            {
                //In the event of an error, make it obvious
                Console.BackgroundColor = ConsoleColor.DarkRed;
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine(ex.ToString());
                Console.ForegroundColor = ConsoleColor.White;
                Console.BackgroundColor = ConsoleColor.Black;

                return false;
            }

        }

        /// <summary>
        /// On call, it creates a new user with the given Username and Password (hash)
        /// </summary>
        /// <param name="user">Username of the given account</param>
        /// <param name="password">Password of the given account</param>
        /// <returns>bool of success</returns>
        public async Task<bool> CreateUser(string user, string password)
        {
        try
            {
                bool? perms = await CheckIfHost();
            //Check the perms of the user. Deny if not allowed
            if(perms != true)
            {
                return false;
            }

                //Verify that there is no double usernames
                foreach(User person in _loginStore.Data.users)
                {
                    if (user.Equals(person.username))
                    {
                        return false;
                    }
                }

                //Hash the password attempt
                string passHash = HashString(password);

                //Create a new user object to add into the array
                User freshUser = new User();

                //Set the data points on the new user
                freshUser.username = user;
                freshUser.pass = passHash;

                //Increment the ID counter
                freshUser.ID = _loginStore.Data.IncrementID();

                //Temporary list to add the user into the array
                List<User> tempList = new List<User>();

                //adding array
                tempList.AddRange(_loginStore.Data.users);
                //adding user
                tempList.Add(freshUser);

                //Set the storage array
                _loginStore.Data.users = tempList.ToArray();

                _loginStore.SaveChanges();

                await Clients.All.SendAsync("UserSuccessfullyDisconnects", user);

                return true;
            
            } catch(Exception ex)
            {
                //In the event of an error, make it obvious
                Console.BackgroundColor = ConsoleColor.DarkRed;
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine(ex.ToString());
                Console.ForegroundColor = ConsoleColor.White;
                Console.BackgroundColor = ConsoleColor.Black;

                return false;
            }
        }

        /// <summary>
        /// This function changes the password of a user
        /// </summary>
        /// <param name="uID">UserID being changed</param>
        /// <param name="newPass">New password hash</param>
        /// <returns>bool of success</returns>
        public async Task<bool> ChangeUserPassword(int uID, string newPass)
        {
            try
            {

            bool? perms = await CheckIfHost();
            //Check the perms of the user. Deny if not allowed
            if(perms != true)
            {
                return false;
            }

                //Hash the password attempt
                string passHash = HashString(newPass);

                List<User> uList = new List<User>();

                foreach(User person in _loginStore.Data.users)
                {
                    if(person.ID == uID)
                    {
                        person.pass = passHash;
                    } 
                        uList.Add(person);
                    
                }

                //Save the state in the current state registry
                _loginStore.Data.users = uList.ToArray();

                //Save teh changes in the file
                _loginStore.SaveChanges();

                //Notify the user of success
                return true;


            }catch(Exception ex)
            {
                //In the event of an error, make it obvious
                Console.BackgroundColor = ConsoleColor.DarkRed;
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine(ex.ToString());
                Console.ForegroundColor = ConsoleColor.White;
                Console.BackgroundColor = ConsoleColor.Black;

                return false;
            }
        }

        /// <summary>
        /// This will delete a user on demand
        /// </summary>
        /// <param name="uID">User ID being deleted</param>
        /// <returns>Bool of success</returns>
        public async Task<bool> DeleteUser(int uID)
        {

            try
            {
            bool? perms = await CheckIfHost();
            //Check the perms of the user. Deny if not allowed
            if(perms != true)
            {
                return false;
            }

            //Setting up the temp list
            List<User> tempList = new List<User>();

            string holderName = "";
            string holderConnection = "";

            foreach(User person in _loginStore.Data.users)
            {
                if(person.ID != uID)
                {
                    tempList.Add(person);
                } else
                {
                    //Log the user
                    holderName = person.username;

                    //Get the current connection to force disconnect them
                    holderConnection = person.currentConnection;
                }
            }

                //Save the state in the current state registry
                _loginStore.Data.users = tempList.ToArray();

                //Save teh changes in the file
                _loginStore.SaveChanges();

                //Tell users to remove this user
                await Clients.All.SendAsync("UserSuccessfullyLoggedIn", holderName);

                await disconnectSingleUserByConn(holderConnection);

                //Notify the user of success
                return true;


            }catch(Exception ex)
            {
                //In the event of an error, make it obvious
                Console.BackgroundColor = ConsoleColor.DarkRed;
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine(ex.ToString());
                Console.ForegroundColor = ConsoleColor.White;
                Console.BackgroundColor = ConsoleColor.Black;

                return false;
            }
        }


        public async Task<bool> forceDisconnectAUser(int ID)
        {
             try
            {
            bool? perms = await CheckIfHost();
            //Check the perms of the user. Deny if not allowed
            if(perms != true)
            {
                return false;
            }

            //Setting up the temp list
            List<User> tempList = new List<User>();

            string holderName = "";
            string holderConnection = "";

            foreach(User person in _loginStore.Data.users)
            {
                if(person.ID == ID)
                {
                    //Log the user
                    holderName = person.username;

                    //Get the current connection to force disconnect them
                    holderConnection = person.currentConnection;

                    person.currentConnection = "";


                }

                tempList.Add(person);
            }

                //Save the state in the current state registry
                _loginStore.Data.users = tempList.ToArray();

                //Save teh changes in the file
                _loginStore.SaveChanges();

                await disconnectSingleUserByConn(holderConnection);

                //Notify the user of success
                return true;


            }catch(Exception ex)
            {
                //In the event of an error, make it obvious
                Console.BackgroundColor = ConsoleColor.DarkRed;
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine(ex.ToString());
                Console.ForegroundColor = ConsoleColor.White;
                Console.BackgroundColor = ConsoleColor.Black;

                return false;
            }
        }

        /// <summary>
        /// This function is used to disconnect a single user on call. It does this by forcing them back to the login screen, and their connection string should be cleared before using this
        /// </summary>
        /// <param name="connString">String of the user being disconnected</param>
        /// <returns>N/A</returns>
        private async Task disconnectSingleUserByConn(string connString)
        {
            //If the conn string is non-existant, complete
            if(connString.Length < 1)
            {
                return;
            }

            await Clients.Client(connString).SendAsync("LogOut");
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