import {loadComponent} from "../router.js";
import { hashPassword } from "../app.js";

var ddList = [];

export function init(container, appState){


const loginBtn = container.querySelector("#LogInButton");
  
loginBtn.addEventListener("click", async () => {ValidateCreds(container, appState)});

getUserList(appState);
}


async function getUserList(state){
    ddList = await state.connection.invoke("GetUserNameList")

    console.log(ddList)
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
    var success = await appState.connection.invoke("UserLogin", user, newPass);
}










