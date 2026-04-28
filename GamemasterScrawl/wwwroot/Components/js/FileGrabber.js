
//This allows the user to upload images
export function getImageFile(){

    //Return the image called by user
    return new Promise((resolve) => {
        //Adding the element that grabs the image
        const fileUploader = document.createElement("input");
        fileUploader.type = "file";
        fileUploader.accept = "image/*";
        fileUploader.style.display = "none";

        //Get the image set
        fileUploader.addEventListener("change", () => {
            const file = fileUploader.files[0];
            if(document.body.contains(fileUploader)) document.body.removeChild(fileUploader);
            resolve(file);
        });


        //on user changing mind
        fileUploader.addEventListener("cancel", () => {
            if(document.body.contains(fileUploader)) document.body.removeChild(fileUploader);
            resolve(null);
        })

        //Open the file explorer instance
        fileUploader.click();
    })
}