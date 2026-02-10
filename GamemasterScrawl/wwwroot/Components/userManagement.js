import {loadComponent} from "../router.js";
import { connection } from "../app.js";

export function init(container, appState){


const returnHomeBtn = container.querySelector("#returnHome");
  
returnHomeBtn.addEventListener("click", async () => {loadComponent("home")});
}