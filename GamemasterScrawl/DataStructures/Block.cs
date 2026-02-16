namespace GamemasterScrawl {


    public class Block {
        public (int, int, int) Coords {get; set;} = (0,0,0);
        //The ID of the material (See the Room's Material List)
        public int material {get; set;} = 0;
    }

}