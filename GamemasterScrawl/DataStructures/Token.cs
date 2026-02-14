namespace GamemasterScrawl
{
    public class StaticToken
    {
        public int ID {get; set;} = 0;
        public string imgRef {get; set; } = "";
        public int[] usersToManipulate {get; set;} = [];
    }

    public class ActiveToken
    {
        public int ID {get; set;} = 0;
        public StaticToken? TokenRef {get; set;}
        public (int, int, int) Coords {get; set;} = (0,0,0);
        public int[] additionalEditors {get; set;} = [];
    }
}