import {loadComponent, referenceState} from "./router.js";

//The SignalR connection (AKA socket conenction)
//It's used to maintain a connection with the server
const connection = new signalR.HubConnectionBuilder().withUrl("/socketHub").build();

//This boolean controls the app's host status
var isHost = false;

//This function checks if the user is the host
export function CheckAmIHost(){
    return isHost;
}

//A global state variable with references to the variables stored in this global layer
export const appState = {
    isHost: false,
    connection: connection
}

//Set the reference to the global state
referenceState(appState);

//This hashes the password before sending across the internet
export function hashPassword(pass){

    //Adding some salt to the password before hashing
    pass = pass + "I'm salty";

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



//This function asks the server if this user is the host.
export async function checkHostStatus(){

    //Call the server, wait for a response. Set the relevant states that track that
    isHost = await connection.invoke("CheckIfHost");
    appState.isHost = isHost;

    if(isHost === true){
        //This is the super user. No need to log in
        loadComponent("Home");
        
    } else {
        //Go to the login screen
        loadComponent("login");
    }
}



//THis is the function tht calls the cleanup function. 
 connection.on("CloseWindow", function () {
        handleDisconnect();
 });

 //On the event the host orders a logout, go to the login screen
 connection.on("LogOut", function (){
    if(!isHost){
        loadComponent("login")
    }
 });

 //THis function handles all the cleanup for the code. It is run only on app shutdown
 async function handleDisconnect(){
    await connection.stop();
 }

 //This is run on page load. It initializes the socket connection
 async function startConnection(){
    try{
        await connection.start();

        await checkHostStatus();

    } catch(err){
        //Try again in a few seconds
setTimeout(startConnection, 5000);
    }
 }


//Start the socket connection (And other startup functions)
startConnection();