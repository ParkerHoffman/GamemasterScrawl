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
        loadComponent("home");
        
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
        toastUser('Kicked', `The host has decided to kick you. You've been logged out`, 'warn')
        loadComponent("login")
    }
 });

 //THis function handles all the cleanup for the code. It is run only on app shutdown
 async function handleDisconnect(){
    await connection.stop();
 }

  //On call of this function, the user gets a custom toast
 export function toastUser(header, message, type, duration = 3000){

    if(type.length === 0 ){
        type = 'info';
    }

    //The toast container
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    const toastID = `ToastID${Date().now}`

    //Setting it up as a ${type} toast
    toast.className = `toast ${type}`;

    const toastHeader = document.createElement('div');

    toastHeader.innerText = header;

    toastHeader.className = 'toastHeader';


    const toastMessage = document.createElement('div');

    toastMessage.innerText = message;

    //Set up other properties of the toast
    toast.id = toastID;
    toast.appendChild(toastHeader);
    toast.appendChild(toastMessage);

    //Birth the child
    container.appendChild(toast);

    //CSS anim
    setTimeout(() => toast.classList.add('show'), 10)

    //Kill the child
    const removeToast = () => {
        toast.classList.remove("show");
        //Wait for the toast to slide out before I take a knife to it
        toast.addEventListener('transitionend', () => toast.remove());
    }

    //Child murdering time (with a short delay for dramatic effect)
    setTimeout(removeToast, duration);

 }

  //On the event a user calls a toast
 connection.on("callToast", function (header, message, type){
    toastUser(header, message, type);
 });

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