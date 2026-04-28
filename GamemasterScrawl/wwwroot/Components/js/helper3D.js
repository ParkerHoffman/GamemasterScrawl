import * as THREE from 'three';

    //Instantiate a cube for later use
    const geometry = new THREE.BoxGeometry(1,1,1);
    // Initialize the Texture Loader
    export const loader = new THREE.TextureLoader();
    //Path to the material Folder
    export const rootPathMat = `/Components/FileMaterials/Materials`;
    //Path to the Token Folder
    export const rootPathTok = `/Components/FileMaterials/TokenImages`;

    //Cube edge constants
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

    //Creates a token
    //Returns the THREE.js token object for manipulation
function createVisibleToken(token){

    //This handles the token's background. Defaults to the defaul image if no image provided
        const imgPath = token.tokenRef?.imgRef
        ? `/Components/FileMaterials/TokenImages/${token.tokenRef.imgRef}`
        : "/Components/FileMaterials/Assets/DefaultToken.png";

        //Loading in the image
        const texture = loader.load(imgPath);

        //Creating the token
        const geometry = new THREE.CircleGeometry(0.5, 32);
        //setting up the texture for the token
    const material = new THREE.MeshBasicMaterial({ 
        map: texture,
        side: THREE.DoubleSide
    });

    //Creating the token with given geometry and texture
    const mesh = new THREE.Mesh(geometry, material);
    //Setting the token location
    mesh.position.set(token.x, token.y, token.z);


    //The token needs to always face the camera
    mesh.onBeforeRender = (renderer, scene, camera) => {
        mesh.quaternion.copy(camera.quaternion);
    };

    //Settings for later access
    mesh.userData.id = token.id;
    mesh.renderOrder = 999;

    return mesh;
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

//This creates a single 3D block for map use
export function make3DBlock(imgRef, moreArgs){
    
    //default material
    var material = new THREE.MeshBasicMaterial({color: imgRef || "#aaaaaa", transparent: true, opacity: 0});
    if(imgRef !== null){
        try{
            //Get the image
            var texture =  loader.load(
                `${rootPathMat}/${imgRef}`,
                //On success: We don't care
                undefined,
                //On Progress: We don't care
                undefined,
                //On error:
                undefined
            );
            
            //Set the material to be the fetched texture
             material = new THREE.MeshBasicMaterial({map: texture, ...moreArgs});
        } catch {
            //Do nothing, and default material use
        }
            
    } else {
        //Ghost cube
       material = new THREE.MeshBasicMaterial({color: "#b200ed", transparent: true, opacity: 0});
    }

    //Create the actual cube
    const cube = new THREE.Mesh(geometry, material);

    //If it's not a ghost cube
    if(imgRef !== null)
    {
        //Add outline to the edges of the cube
        const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
        cube.add(edgeLines);
    }


    return cube;
}


//Generates a random int between the given values
export function generateRandomNumber(min, max){
    return Math.floor(Math.random() * (max - min) + min);
}

//Cleans up scenes for use with other instances
export function clearScene(scene){
    //Delete every object
    for(let i = scene.children.length - 1; i >= 0; i--){
            const obj = scene.children[i];
            //UNLESS marked to not be deleted (Ghost Cube, etc)
            if(obj.userData?.persistent) continue;
            scene.remove(obj);
    }
}

//This function renders a room
export function renderRoom(scene, room, doTokens){
    //Empty the previous room state
    clearScene(scene);

    //Get room bounds
    const maxDims = getRoomBounds(room);

    //Display room bounds
    renderRoomBounds(scene, maxDims);
    
    //Iterate through every block
    room.blockList.forEach(block => {
        //Create cube
        const cube = make3DBlock(block.material);

        //Cube positioning
        cube.position.x = block.x;
        cube.position.y = block.y;
        cube.position.z = block.z;

        scene.add(cube);
        }
    )

    //Check if tokens should be manageable in this space
    if(doTokens){
        //Iterate through the tokens
            room.tokens.forEach((token) => {
                //Create an outer mesh for the token (edge + rendering ghost cube correctly)
                const tokenCover = make3DBlock(null);

                //cover positioning
                tokenCover.position.x = token.x;
                tokenCover.position.y = token.y;
                tokenCover.position.z = token.z;

                //Setup data
                tokenCover.userData.id = token.id;

                //Create token objecy
                const tokenObject =  createVisibleToken(token);
                
                //Add both objects to the scene
                scene.add(tokenObject);
                scene.add(tokenCover)


            })
    }
}

//Gets the room bounds for rendering
function getRoomBounds(room){
    return {
        x: room.xDimension,
        y: room.yDimension,
        z: room.zDimension,

        maxX: room.xDimension - 1,
        maxY: room.yDimension - 1,
        maxZ: room.zDimension - 1

    }
}

//Draws lines around the edges of teh room, for visual clarity
function renderRoomBounds(scene, bounds){

    //Sets up a new box to draw edges around
    const geometry = new THREE.BoxGeometry(
        bounds.x, bounds.y, bounds.z
    )

    //Setting up the edges
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({color: 0x3688f4})

    //Creating teh wireframe
    const wireframe = new THREE.LineSegments(edges, material);
    wireframe.position.set(
        bounds.x / 2 - .5,
        bounds.y / 2 - .5,
        bounds.z / 2 - .5
    );

    //Adding the wireframe to the scene
    scene.add(wireframe);
}

//Creates a 3D scene for use in ither functions
export async function Generate3DSpace(container, contName, appState, renderer, camera, scene, controls){
    //The container the space is found in
    const spaceCont = container.querySelector(contName);

    //Update the store for cleanup
    appState.sceneSet.add({renderer: renderer, scene: scene})

    renderer.setClearColor(0x000000, 0); // transparent background

    //Bounding box of the space
    const rect = spaceCont.getBoundingClientRect();

    //Setting up the space to match this size
    renderer.setSize(rect.width, rect.height);

    //Camera setup
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();

    //Adding the renderer
    spaceCont.appendChild(renderer.domElement);
        //Defaul camera position
        camera.position.z = 15;

        function animate() {
            //Require damping is true, and thus I must update the controls
            controls.update(); 

    //render the scene
    renderer.render(scene, camera);
}

//Every rame, run the animation loop above
renderer.setAnimationLoop( animate );
}