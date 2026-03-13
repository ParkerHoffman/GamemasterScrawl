

export function getImageFile(){

    return new Promise((resolve) => {
        const fileUploader = document.createElement("input");
        fileUploader.type = "file";
        fileUploader.accept = "image/*";
        fileUploader.style.display = "none";

        fileUploader.addEventListener("change", () => {
            const file = fileUploader.files[0];
            if(document.body.contains(fileUploader)) document.body.removeChild(fileUploader);
            resolve(file);
        });



        fileUploader.addEventListener("cancel", () => {
            if(document.body.contains(fileUploader)) document.body.removeChild(fileUploader);
            resolve(null);
        })

        fileUploader.click();
    })
}