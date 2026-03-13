import * as THREE from 'three';



    const geometry = new THREE.BoxGeometry(1,1,1);
    // Initialize the Texture Loader
    export const loader = new THREE.TextureLoader();
    //Path to the material Folder
    export const rootPathMat = `/Components/FileMaterials/Materials`;
    //Path to the Token Folder
    export const rootPathTok = `/Components/FileMaterials/TokenImages`;

    //Cube constants
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });


export function getTokenImage(ref){

}

export function createSpecialBlock(block){
            const geometry = new THREE.TorusKnotGeometry( .3, .02, 64, 8 , generateRandomNumber(1, 21), generateRandomNumber(1, 21))
            const material = new THREE.MeshBasicMaterial( { color: block.material } );
            const magicTorus = new THREE.Mesh( geometry, material );

            //Setting a random rotation speed
            magicTorus.userData.rotation = {    x: generateRandomNumber(1, 9) * .1, y: generateRandomNumber(1, 9) * .1, }
            magicTorus.userData.stutterInterval = generateRandomNumber(1, 9) * .1;

            magicTorus.userData.stutterTimer = 0;

            return magicTorus;
}

export function make3DBlock(imgRef, moreArgs){

    var material = null;
    if(imgRef !== null){
        var texture =  loader.load(
                `${rootPathMat}/${imgRef}`,
                //On success: We don't care
                undefined,
                //On Progress: We don't care
                undefined,
                //On error:
                (err) =>{
                    loader.load(`${rootPathMat}/Default_Mossy_Stone.jpg`, (defaultTex) => {
                texture.image = defaultTex.image;
                texture.needsUpdate = true;
            });
                }
            )

            //Be sure to credit: https://ambientcg.com/
    
             material = new THREE.MeshBasicMaterial({map: texture, ...moreArgs});
            

            
    } else {
       material = new THREE.MeshBasicMaterial({color: "#b200ed", transparent: true, opacity: 0});
    }

            const cube = new THREE.Mesh(geometry, material);

     

        const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
        cube.add(edgeLines);


        return cube;
}



export function generateRandomNumber(min, max){
    return Math.floor(Math.random() * (max - min) + min);
}