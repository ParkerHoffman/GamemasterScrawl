using System.Reflection.Metadata;

namespace GamemasterScrawl
{
    public class LoginState
    {
        public User[] users {get; set;} = [];
    }

        public class User
    {
        public string username {get; set;} = "";
        public string pass {get; set;} = "";
        public int ID {get ;set;} = -1;
        public string currentConnection {get; set;} = "";


    }


}