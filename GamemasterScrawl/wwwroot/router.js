let appState;

//All this does is update the pointer reference on call. This is necessary to be run once on page load to set up the pointers and never again
export async function referenceState(refState){
    appState = refState;
}

//THis function is used to fetch and switch to different pages without ever causing a redirect
export async function loadComponent(name) {
    //Get the entire app that can be changed up
  const app = document.getElementById("app");

  //Fetch the new components
    const res = await fetch(`/components/${name}.html`);

    //Force the html to have to be loaded before continuing
    const html = await res.text();

    //Set the inner HTML to the given
  app.innerHTML = html;

  //Get and load the correct JS
  const module = await import(`/components/${name}.js`);
  
  if(module){
  //Initialize the JS
  module.init(app, appState);
  }


}
