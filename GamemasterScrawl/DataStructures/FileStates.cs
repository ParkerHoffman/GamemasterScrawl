using System.Reflection.Metadata;

namespace GamemasterScrawl
{
    public class LoginState
    {
        public User[] users {get; set;} = [];
        public int lastID {private get; set;} = 0;

        public int IncrementID()
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

            return newID;
        }
    }

        public class User
    {
        public string username {get; set;} = "";
        public string pass {get; set;} = "";
        public int ID {get ;set;} = -1;
        public string currentConnection {get; set;} = "";

        //This is the login check function
        //passwords have to be allowed to go up the chain, otherwise they're overwritten (possible optimization later)
        public bool checkLoginAbility(string passHash)
        {
            return  currentConnection.Length == 0 && pass.Equals(passHash);
        }


    }


}