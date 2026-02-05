 namespace GamemasterScrawl
{
    public class HostIdentity
    {
        public string? HostConnectionID {get; private set;}


//Returns true if the given ID is the host ID
        public bool CheckHost(string newID)
        {
            Console.WriteLine("Host: " + HostConnectionID + ", Checker: " + newID);
            return newID == HostConnectionID;
        }

        public void RegisterHost(string newID)
        {
            Console.WriteLine("Host: " + HostConnectionID + ", Checker: " + newID);
            if(HostConnectionID == null)
            {
                Console.WriteLine("New Host: " + newID);
                HostConnectionID = newID;
            } 

        }
    }
}
