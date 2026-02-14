namespace GamemasterScrawl {
    public class MapSystem {
        public int activeRoom {get; set;} = -1;
        public Room3D[] roomList {get; set;} = [];
        public SingleMap[] maplist {get; set;} = [];

    }

    public class SingleMap {
        public int ID {get; set;} = -1;
        public string mapName {get; set;} = "";
    }
}