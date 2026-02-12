 namespace GamemasterScrawl
{
    public class HostIdentity
    {
        //The reference of the host's connection ID
        public string? HostConnectionID {get; private set;}

        /// <summary>
        /// Gets the Host's Connection ID
        /// </summary>
        /// <returns>String of Host ConnectionID</returns>
        public string? GetHost()
        {
            return HostConnectionID;
        }

        /// <summary>
        /// This function checks if the user is registered as the host
        /// </summary>
        /// <param name="newID">This is the ID we're checking against. Returns true if they match the host</param>
        /// <returns></returns>
        public bool CheckHost(string newID)
        {
            return newID.Equals(HostConnectionID);
        }

        /// <summary>
        /// This function attempts to register the given user as the host. It will do nothing if there is a host alreayd registered
        /// </summary>
        /// <param name="newID">This is the user attempting to register as host</param>
        public void RegisterHost(string newID)
        {
            if(HostConnectionID == null)
            {
                HostConnectionID = newID;
            } 

        }
    }
}
