const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // defalt port
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "1234" : "http://www.lighthouselabs.ca",
  "2134" : "http://www.google.com"
};

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


//generate random number for URL ID
function generateRandomString() {
  let tinyURL = "";
  let possible = "0123456789";

  for (let i = 0; i < 4; i++)
    tinyURL += possible.charAt(Math.floor(Math.random() * possible.length));

  return tinyURL;
}

//map the long URL to the Short URL
app.get("/u/:shortURL", (request, response) => {
// if (longURL[6] === '/'){
    let longURL = urlDatabase[request.params.shortURL];
    response.redirect(longURL);
  // } else {
  //     let longURL = 'http://' + urlDatabase[request.params.shortURL];
  //     response.redirect(longURL);
  // }
});

//Show New URL Page
app.get("/urls/new", (request, response) => {
  let templateVars = {
    email: response.cookie["user_emailCookie"],
    id: response.cookie["user_IDCookie"]
  };
  response.render("urls_new", templateVars);
});

//delete URL
app.post("/urls/:shortURL/delete", (request, response) =>{
  let key = request.params.shortURL
  delete urlDatabase[key]
  response.redirect("/urls");
});

//update URL
app.post("/urls/:shortURL", (request, response) =>{
  let key = request.params.shortURL
  urlDatabase[key] = request.body.longURL;
  response.redirect("/urls");
});


//get registration page
app.get("/register", (request, response) => {
  response.render('register');
});


//post registration info
app.post("/register", (request, response) => {
  let email = request.body.email
  let key = generateRandomString()
  let user = key
    key.id = key
    key.email = request.body.email
    key.password = request.body.password
  users[key] = user
  response.cookie('user_emailCookie', email)
  response.cookie('user_IDCookie', key)
  response.redirect("/urls");
});


//login
app.post("/login", (request, response) =>{
  let email = request.body.email
  response.cookie('user_emailCookie', email)
  console.log(request)
  response.redirect("/urls");
});


//logout
app.post("/logout", (request, response) =>{
    let templateVars = {
    email: response.cookie["user_emailCookie"],
    id: response.cookie["user_IDCookie"]
  };
  response.clearCookie('user_emailCookie');
  response.clearCookie('user_IDCookie');
  //console.log(username)
  response.redirect("/register");
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
    //username: request.cookies["usernameCookie"],
    urls: urlDatabase,
    email: response.cookie["user_emailCookie"],
    id: response.cookie["user_IDCookie"]
  };
  console.log(users)
  response.render('urls_index', templateVars);
});


//get detail page
app.get("/urls/:id", (request, response) => {
  let key = request.params.id
  let templateVars = {
    //username: request.cookies["usernameCookie"],
    shortURL: request.params.id,
    urls: urlDatabase,
    url: urlDatabase[key]
  };
  response.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example App Docked at port ${PORT} Capt'n`);
});
