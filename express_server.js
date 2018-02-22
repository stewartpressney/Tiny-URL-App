const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // defalt port
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(cookieParser())

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
  let templateVars = {
    username: request.cookies["usernameCookie"]
  };
  response.render("urls_new", templateVars);
});

//delete
app.post("/urls/:shortURL/delete", (request, response) =>{
  let key = request.params.shortURL
  delete urlDatabase[key]
  response.redirect("/urls");
});

//update
app.post("/urls/:shortURL", (request, response) =>{
  let key = request.params.shortURL
  urlDatabase[key] = request.body.longURL;
  response.redirect("/urls");
});

//login
app.post("/login", (request, response) =>{
  let username = request.body.username
  response.cookie('usernameCookie', username)
  console.log(username)
  response.redirect("/urls");
});


//logout
app.post("/logout", (request, response) =>{
    let templateVars = {
    username: request.cookies["usernameCookie"],
  };
  response.clearCookie('usernameCookie');
  //console.log(username)
  response.redirect("/urls");
});



//take in string and post it to the URLdatabase object
app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body.longURL;
  response.redirect(`urls/${shortURL}`);
});

//get homepage
app.get("/urls", (request, response) => {
  let templateVars = {
    username: request.cookies["usernameCookie"],
    urls: urlDatabase
  };
  console.log(templateVars)
  response.render('urls_index', templateVars);
});


//get detail page
app.get("/urls/:id", (request, response) => {
  let key = request.params.id
  let templateVars = {
    username: request.cookies["usernameCookie"],
    shortURL: request.params.id,
    urls: urlDatabase,
    url: urlDatabase[key]
  };
  response.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example App Docked at port ${PORT} Capt'n`);
});
