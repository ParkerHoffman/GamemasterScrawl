const connection = new signalR.HubConnectionBuilder().withUrl("/socketHub").build();

var isHost = false;


//This is the function run on clicking the 'login' button. It handles logging in
async function ValidateCreds(){
    // Get the username and the password
    var user = document.getElementById("usernameInput").value;
    var pass = document.getElementById("passwordInput").value;

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
    await connection.invoke("UserLogin", user, pass);
    console.log(user, pass);
}

//This function asks the server if this user is the host.
async function checkHostStatus(){

    //Call the server, wait for a response
    isHost = await connection.invoke("CheckIfHost");
    if(isHost = true){
        //Now redirect to the home page
        
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



