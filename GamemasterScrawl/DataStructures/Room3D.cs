

namespace GamemasterScrawl
{
    public class Room3D
    {
        public int ID {get; set;} = -1;

        public int[] connectingRoomsID {get; set;} = [];

        public (int, int, int) roomSize {get; set;} = (0,0,0);

        public ActiveToken[] tokens {get; set;} = [];

        public int[] containerID {get; set;} = [];

        public Block[] blockList {get; set;} = [];

        public string[] MaterialList {get; set;} = [];
    }
}