import {loadComponent} from "../router.js";
import { connection } from "../app.js";

export function init(container, appState){


const loginBtn = container.querySelector("#LogInButton");
  
loginBtn.addEventListener("click", async () => {ValidateCreds(container, appState)});
}


  //This is the function run on clicking the 'login' button. It handles logging in
async function ValidateCreds(container, appState){
    // Get the username and the password
    var user = container.querySelector("#usernameInput").value;
    var pass = container.querySelector("#passwordInput").value;

    //If there is no username, alert the user to this fact
    if(!user){
        alert('Please enter a username');
        return;
    }

    //If there is no password, alert the user to this fact. This error will be utilized from this point onwards
    if(!pass){
        alert(`Please insert a valid password for the user '${user}`);
        return;
    }

    //Tell the server the login creds for it to do it's magic
    var success = await connection.invoke("UserLogin", user, await hashPassword(pass));
}


//This is now erroring out
//This hashes the password before sending across the internet
async function hashPassword(pass){
    //Set up encoder
    const encoder = new TextEncoder();

    //Endcode pass
    const data = encoder.encode(pass);

    const buffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(buffer));

    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}







