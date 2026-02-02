 namespace GamemasterScrawl
{
    public class HostIdentity
    {
        public string? HostConnectionID {get; private set;}


//Returns true if the given ID is the host ID
        public bool CheckHost(string newID)
        {
            return newID == HostConnectionID;
        }

        public void RegisterHost(string newID)
        {
            if(HostConnectionID == null)
            {
                HostConnectionID = newID;
            } 

        }
    }
}
