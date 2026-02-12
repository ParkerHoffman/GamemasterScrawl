let appState;
let currentStyle = null;

//All this does is update the pointer reference on call. This is necessary to be run once on page load to set up the pointers and never again
export async function referenceState(refState){
    appState = refState;
}

//This function is used to fetch and switch to different pages without ever causing a redirect
export async function loadComponent(name) {

  //Wipe old style if possible
  if(currentStyle){
    currentStyle.remove();
    currentStyle = null;
  }


    //Get the entire app that can be changed up
  const app = document.getElementById("app");

  //Fetch the new components
    const res = await fetch(`/components/${name}.html`);

    //Force the html to have to be loaded before continuing
    const html = await res.text();

    //Set the inner HTML to the given
  app.innerHTML = html;

  const cssFile =`/components/${name}.css?v=${Date.now()}`;

  //Setting up the stylesheet reference
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssFile;

  //Setting up loading conditions
  link.onload = () => {};
  link.onerror = () => link.remove();

  //Adding the sheet
  document.head.appendChild(link);

  //Saving the sheet for wiping
  currentStyle = link;

  //Get and load the correct JS
  const module = await import(`/components/${name}.js?v=${Date.now()}`);
  
  if(module){
  //Initialize the JS
  module.init(app, appState);
  }


}
