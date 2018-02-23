const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // defalt port
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const flash = require('connect-flash');

app.set("view engine", "ejs");
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());

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
    email: request.cookies["user_emailCookie"],
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
  let key = generateRandomString();
  let email = request.body.email;
  // let password = request.body.password
  let newUser = {
    id: key,
    email: request.body.email,
    password: request.body.password
  };
  //let urls = urlDatabase;
  users[key] = newUser;
  for (user in users){
    if (user.email === request.body.email){
      response.send('You Are Already Registered.');
      response.status(400);

    } if (request.body.email === "" || request.body.password === "") {
      response.send('You Shall Not Pass -____-');
      response.status(400);

    } else {
      //users[key] = newUser;
      //response.cookie('user_emailCookie', email);
      response.cookie('user_IDCookie', key);
      //console.log(users, email, key, user, newUser)
      response.redirect("/urls");
   }
   console.log(users)
  };
});


//login
app.post("/login", (request, response) =>{
  let email = request.body.email
  let isUser;
  for (let user in users){
    const verifyUser = users[user]
    if (verifyUser.email === request.body.email){
      isUser = verifyUser
      break
    }
  }
  if (isUser){
      if (isUser.password === request.body.password){
        response.cookie('user_IDCookie', isUser.id)
        response.redirect("/urls");
      } else {
        response.status(401).send('There was a problem with your login, please try again.');
      }
  } else {
    response.status(401).send('There was a problem with your login, please try again.');
  }
});


//logout
app.post("/logout", (request, response) =>{
    let templateVars = {
    email: request.cookies["user_emailCookie"],
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
    user: users[request.cookies.user_IDCookie]
    //id: response.cookie["user_IDCookie"]
  };
  //console.log(users)
  console.log(templateVars)
  console.log('Cookies: ', request.cookies)
  console.log('Cookies: ', request.cookie)
  console.log(users)
  response.render("urls_index", templateVars);
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
