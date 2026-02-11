using System.Reflection.Metadata;

namespace GamemasterScrawl
{
    public class LoginState
    {
        public User[] users {get; set;} = [];
        public int lastID {get; private set;} = 0;

        public void IncrementID()
        {
            //Declre the min ID
            int newID = 0;

            //Iterate through every ID
            foreach (User u in users)
            {
                //If the ID is bigger than the placeholder
                if(u.ID >= newID)
                {
                    //make the placeholder larger than it
                    newID = u.ID + 1;
                }
            }
            //Set the increment ID as the next useful number
            lastID = newID;
        }
    }

        public class User
    {
        public string username {get; set;} = "";
        public string pass {private get; set;} = "";
        public int ID {get ;set;} = -1;
        public string currentConnection {get; set;} = "";

        //This prevents passwords from ever leaving this area
        public bool checkLoginAbility(string user, string passHash)
        {
            return  u.currentConnection.Length > 0 && username.Equals(user) && u.pass.Equals(passHash);
        }


    }


}