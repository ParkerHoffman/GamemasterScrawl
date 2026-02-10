using System.Reflection.Metadata;

namespace GamemasterScrawl
{
    public class LoginState
    {
        public User[] users {get; set;} = [];
        public int lastID {get; private set;} = 0;

        public void IncrementID()
        {
            if(lastID < users.Length)
            {
                lastID = users.Length;
            } else
            {
                lastID++;   
            }

        }
    }

        public class User
    {
        public string username {get; set;} = "";
        public string pass {get; set;} = "";
        public int ID {get ;set;} = -1;
        public string currentConnection {get; set;} = "";


    }


}