

namespace GamemasterScrawl
{
    public class Room3D
    {
        public int ID {get; set;} = -1;

        public int[] connectingRoomsID {get; set;} = [];

        
        public int xDimension {get; set;} = 0;

        public int yDimension {get; set;} = 0;

        public int zDimension {get; set;} = 0;

        public ActiveToken[] tokens {get; set;} = [];

        public int[] containerID {get; set;} = [];

        public Block[] blockList {get; set;} = [];

        public string nickname {get; set;} = "";
    }
}