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

    //Hashing the pass
    const newPass = hashPassword(pass);

    //Tell the server the login creds for it to do it's magic
    var success = await connection.invoke("UserLogin", user, newPass);
}


//This is now erroring out
//This hashes the password before sending across the internet
function hashPassword(pass){
    let hash = 0;

    //For each character
    for(let i = 0; i < pass.length; i++){

        //Get current char
        const char = pass.charCodeAt(i);

        //Modify the 'hash' in
        hash = char + (hash << 6) + (hash << 16) - hash;
    }


    //Return the pass as a hex
    return (hash >>> 0).toString(16).padStart(8, '0');
}







