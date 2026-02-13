import {loadComponent} from "../router.js";
import { toastUser } from "../app.js";

//The reference to the library managing 3D stuff
import * as THREE from 'three';

export function init(container, appState){



//If user is the host
if(appState.isHost == true){
    //The holder for the UM Navigator Button
    const manageBtn = container.querySelector("#userManagementHolder");

    manageBtn.innerHTML = "<button id=\"openUserManagement\" class=\"info\">User Management</button>";
    //The button itself
    const usrMangBtn = container.querySelector("#openUserManagement");
  
    usrMangBtn.addEventListener("click", async () => {loadComponent("userManagement")});
    
} else {
    const logOutBtn = container.querySelector("#LogoutButtonHolder");

        logOutBtn.innerHTML = "<button id=\"UserRequestsLogOut\" class=\"info\">Log Out</button>";
    //The button itself
    const usrlogOutBtn = container.querySelector("#UserRequestsLogOut");
  
    usrlogOutBtn.addEventListener("click", async () => {logUsrOut(appState)});
}

}

//Logs the user out
async function logUsrOut(appState){
    //Tell the server the login creds for it to do it's magic
    var success = await appState.connection.invoke("LogUserOut");
    console.log(success, appState);

        if(success === true){
            loadComponent("login");
        } else {
            toastUser("Error", "There was an unknown error. Please try again later", 'error')
        }
    
}