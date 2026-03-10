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
            const geometry = new THREE.TorusKnotGeometry( 1, .2, 10, 1 )
            const material = new THREE.MeshBasicMaterial( { color: block.material } );
            const magicTorus = new THREE.Mesh( geometry, material );

            magicTorus.wireframe = true;

            const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
            magicTorus.add(edgeLines);

            return magicTorus;
}

export function make3DBlock(imgRef, moreArgs){

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
    
            const material = new THREE.MeshBasicMaterial({map: texture, ...moreArgs});
            //const material = new THREE.MeshBasicMaterial({color: 0x3688F4});

     const cube = new THREE.Mesh(geometry, material);

        const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
        cube.add(edgeLines);

        return cube;
}



