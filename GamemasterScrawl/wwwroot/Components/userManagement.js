import {loadComponent} from "../router.js";
import { hashPassword } from "../app.js";

var userList = [];

export async function init(container, appState){


const returnHomeBtn = container.querySelector("#returnHome");
  
returnHomeBtn.addEventListener("click", async () => {loadComponent("home")});

const newUsrBtn = container.querySelector("#CreateNewUser");
  
newUsrBtn.addEventListener("click", async () => {createNewUser(container, appState)});

FetchTableInfo(container, appState);

    //This handles a user logging in, and updates the list to reflect that
    appState.connection.on("UserSuccessfullyLoggedIn", function (username)  {
        FetchTableInfo(container, appState)
    })

    //This handles a user logging in, and removes them from the dd List
    appState.connection.on("UserSuccessfullyDisconnects", function (username)  {
        FetchTableInfo(container, appState)
    })
}


async function createNewUser(container, appState){
     // Get the username and the password
        var userI = container.querySelector("#NewusernameInput")
        var passI = container.querySelector("#NewpasswordInput")

        var user = userI.value;
        var pass = passI.value;
    
        //If there is no username, alert the user to this fact
        if(!user){
            toastUser(`Please enter a new username`, 'error')
            return;
        }
    
        //If there is no password, alert the user to this fact. This error will be utilized from this point onwards
        if(!pass){
            toastUser(`Please insert a valid password for the user '${user}`, 'error')
            return;
        }
    
        //Hashing the pass
        const newPass = hashPassword(pass);
    
        //Tell the server the login creds for it to do it's magic
        var success = await appState.connection.invoke("CreateUser", user, newPass);

        if(success == true){
            FetchTableInfo(container, appState);

            passI.value = "";
            userI.value = "";
        } else {
            toastUser(`Unable to create this user at this time. It could be due to a server error, or the username is not unique`, 'error')
        }
}


async function FetchTableInfo(container, appState){
userList = await appState.connection.invoke("GetFullUserList");

    UpdateTable(container, appState);
}

function UpdateTable(container, appState){
    const displayTableCont = container.querySelector("#UsermanagementTableContainer");


    var innerString = "<table><thead><tr><td>ID</td><td>Username</td><td>Edit Password</td><td>User Status</td><td>Kick User</td><td>Delete User</td></tr></thead><tr>";

    userList.forEach((e) => {
        innerString += `<tr><td>${e.id}</td><td>${e.username}</td><td><input id=\"passwordChange${e.id}\"/><button id=\"passwordChangeSubmit${e.id}\">Change Password</button></td><td>`
        
        if(e.currentConnection && e.currentConnection.length > 0){
            innerString += `Active</td><td><button id=\"kickUser${e.id}\">Kick</button></td><td><button id=\"deleteUser${e.id}\">Delete</button></td></tr>`
        } else {
            innerString += `</td><td></td><td><button id=\"deleteUser${e.id}\">Delete</button></td></tr>`
        }
        
    })



    innerString += "</table>";


    displayTableCont.innerHTML = innerString;

    //Setting up the listener set for all the buttons
        userList.forEach((e) => {
            //Getting the password change buttons
            const passEditBtn = container.querySelector("#passwordChangeSubmit" + e.id);
            //Setting up the listener
            passEditBtn.addEventListener("click", async () => {changeUserPassword(container, appState, e.id)});
            
            //Getting the user delete button
            const usrDelBtn = container.querySelector("#deleteUser" + e.id);
  
            //Setting up the delete function
            usrDelBtn.addEventListener("click", async () => {DeleteUser(container, appState, e.id)});

                        //Getting the user delete button
            const usrKickBtn = container.querySelector("#kickUser" + e.id);
  
            //Setting up the delete function
            usrKickBtn.addEventListener("click", async () => {kickUser(container, appState, e.id)});

    })
}


//This is the function that handles changing a user's password
async function changeUserPassword(container, appState, id){
    //This is the container that holds the unhashed password
    var unhashedPassCont = container.querySelector(`#passwordChange${id}`);

    //This hashes the password
    var hashed = hashPassword(unhashedPassCont.value);

    //Now we ask the server to change the password of the user
    var success = await appState.connection.invoke("ChangeUserPassword", id, hashed);

    if(success == true){
        unhashedPassCont.value = "";
    } 
}

async function DeleteUser(container, appState, id){

    var success = await appState.connection.invoke("DeleteUser", id);

    if(success == true){
        FetchTableInfo(container, appState);
        toastUser(`User successfully deleted`, 'success')
    } else {
        toastUser(`Unable to delete user`, 'error')
    }
}


async function kickUser(container, appState, id){
    var success = await appState.connection.invoke("forceDisconnectAUser", id);

        if(success == true){
        FetchTableInfo(container, appState);
        toastUser(`Successfully logged the user out`, 'success')
    } else {
        toastUser(`Error kicking user`, 'error')
    }
}