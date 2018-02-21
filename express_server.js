const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // defalt port
const bodyParser = require("body-parser");

app.set("view engine", "ejs");

const urlDatabase = {
  "1234" : "http://www.lighthouselabs.ca",
  "2134" : "http://www.google.com"
};

//generate random number for URL ID
function generateRandomString() {
  let tinyURL = "";
  let possible = "0123456789";

  for (let i = 0; i < 4; i++)
    tinyURL += possible.charAt(Math.floor(Math.random() * possible.length));

  return tinyURL;
}

app.get("/u/:shortURL", (request, response) => {
  let longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});


//take in string and post it to the URLdatabase object
app.post("/urls", (request, response) => {
  urlDatabase[generateRandomString()] = request;
  console.log(request.body);
  response.redirect("urls/:id");
});

app.get("/urls", (request, response) => {
  let templateVars = {
    urls: urlDatabase
  };
  response.render("urls_index", templateVars);
});

app.get("/urls/:id", (request, response) => {
  let templateVars = {
    shortURL: request.params.id,
    urls: urlDatabase,
    port: PORT
  };
  response.render("urls_show", templateVars);
});


app.listen(PORT, () =>{
  console.log(`Example App Docked at port ${PORT} Capt'n`);
});
