//THis function is used to fetch and switch to different pages without ever causing a redirect
export async function loadComponent(name) {
    //Get the entire app that can be changed up
  const app = document.getElementById("app");

  //Fetch the new components
  const html = await fetch(`/components/${name}.html`)
    .then(r => r.text());


    //Set the inner HTML to the given
  app.innerHTML = html;

  //Get and load the correct JS
  const module = await import(`/components/${name}.js`);
  
  if(module){
  //Initialize the JS
  module.init(app);
  }


}
