


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







