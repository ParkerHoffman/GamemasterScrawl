import {loadComponent} from "./router.js";

export const connection = new signalR.HubConnectionBuilder().withUrl("/socketHub").build();

var isHost = false;

function CheckAmIHost(){
    return isHost;
}



//This function asks the server if this user is the host.
async function checkHostStatus(){

    //Call the server, wait for a response
    isHost = await connection.invoke("CheckIfHost");
    if(isHost === true){
        //Log in. This is the super user
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