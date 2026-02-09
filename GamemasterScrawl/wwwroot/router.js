export async function loadComponent(name) {
    console.log(name);
    //Get the entire app that can be changed up
  const app = document.getElementById("app");
  console.log(app);

  //Fetch the new components
  const html = await fetch(`/components/${name}.html`)
    .then(r => r.text());

    console.log(html);

    //Set the inner HTML to the given
  app.innerHTML = html;

  //Get and load the correct JS
  //const module = await import(`/components/${name}.js`);
  //module[`init${capitalize(name)}`](app);
}

/*
function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
} */
