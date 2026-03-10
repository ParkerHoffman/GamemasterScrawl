using System.Text.Json;

namespace GamemasterScrawl {


    public class Block {
        public int x {get; set;}
        public int y {get; set;}
        public int z {get; set;}
        public string material {get; set;} = "";
        public bool? isInteractable {get; set;} = false;
        public JsonElement? interactableInfo {get; set;} = null;
    }

}