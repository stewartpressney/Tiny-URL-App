const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // defalt port
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
// const hashedPassword = bcrypt.hashSync(password, 10);


app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
//app.use(cookieParser())


let users = {
  "userRandomID": {
    id: "4455",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },

  "user2RandomID": {
    id: "5544",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  'k9we19': {
    id: 'k9we19',
    email: 'stew@stew.com',
    password: '$2a$10$iYNOW.LiNLdlUuU3StE17eb5gTU.IjFON58e3.4eEmqdUJCqLfrnC'
  }
}

const urlDatabase = {
  "1234": {
    shortURL: "1234",
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },

  "2134": {
    shortURL: "2134",
    longURL: "http://www.google.com",
    userId: "userRandomID"
  }
}


//generate random number for URL ID
function generateRandomString() {
  let tinyURL = "";
  let possible = "0123456789abcdefghijklmnopqrstuvwxyz";

  for (let i = 0; i < 6; i++)
    tinyURL += possible.charAt(Math.floor(Math.random() * possible.length));

  return tinyURL;
}




//map the long URL to the Short URL
app.get("/u/:shortURL", (request, response) => {
  // if (longURL[6] === '/'){
  var urls = urlDatabase
  var shortURL = request.params.shortURL;
  var longURL = urls[shortURL].longURL;
  response.redirect(longURL);
  // } else {
  //     let longURL = 'http://' + urlDatabase[request.params.shortURL];
  //     response.redirect(longURL);
  // }
});


//Show New URL Page
app.get("/urls/new", (request, response) => {
  var userCookie = request.session.user_id;
  var user = users[userCookie];
  let templateVars = {
    email: user.email,
    id: user.id,
    user: user
  };
  response.render("urls_new", templateVars);
});


//delete URL
app.post("/urls/:shortURL/delete", (request, response) => {
  console.log("im in post delete");
  if (checkforUser()) {
    delete urlDatabase[request.params.shortURL]
    response.redirect("/urls");
  } else {
    res.send("Error, you cannot Access this URL");
  }
});


//update URL
app.post("/urls/:shortURL", (request, response) => {
  let key = request.params.shortURL
  var userCookie = request.session.user_id;
  var user = users[userCookie];
  var urls = getUserURL(user);
  var tempObject = {
    shortURL: urls[key],
    longURL: request.body.longURL,
    user: user,
    urls: urls
  };
  urlDatabase[key].longURL = request.body.longURL;
  var templateVars = {
    user: user,
    urls: urls
  };
  response.render('urls_index', templateVars);
});


//get registration page
app.get("/register", (request, response) => {
  response.render('register');
});


function checkforUser(email) {
  for (user in users) {
    if (user.email === email) {
      return (users[user]);
    }
  }
}


//post registration info
app.post("/register", (request, response) => {
  let key = generateRandomString();
  let email = request.body.email;
  let password = request.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  let newUser = {
    id: key,
    email: request.body.email,
    password: hashedPassword
  };
  for (var user in users) {}
  const isUser = checkforUser(request.body.email)
  if (isUser) {
    response.send('You Are Already Registered.');
    response.status(400);
  }
  if (request.body.email === "" || request.body.password === "") {
    response.send('You Shall Not Pass -____-');
    response.status(400);
  } else {
    let templateVars = {
      urls: urlDatabase,
      user: request.session.user_id
    }
    users[key] = newUser
    request.session.user_id = key;
    response.redirect("/urls")
    response.render(templateVars);
  }
});


//login
app.post("/login", (request, response) => {
  var email = request.body.email;
  var password = request.body.password;
  var thisUser; // starts as undefined because we haven't found our man/woman/creature/alien
  for (var user_id in users) {
    const verifyUser = users[user_id];
    if (verifyUser.email === request.body.email) {
      thisUser = verifyUser;
      break;
    }
  }
  if (thisUser) {
    if (bcrypt.compareSync(password, thisUser.password)) {
      request.session.user_id = user_id;
      response.redirect("/urls");
    } else {
      response.status(401).send('There was a problem with your login, please try again.');
    }
  } else {
    response.status(401).send('There was a problem with your login, please try again.');
  }
});


//logout
app.post("/logout", (request, response) => {
  request.session = null;
  response.redirect("/register");
});


//take in string and post it to the URLdatabase object
app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  var userCookie = request.session.user_id;
  var user = users[userCookie];

  var tempObject = {
    shortURL: shortURL,
    longURL: request.body.longURL,
    userId: request.session.user_id,
    urls: urlDatabase
  };
  urlDatabase[shortURL] = tempObject;
  response.redirect(`urls/${shortURL}`);
});


function getUserURL(user) {
  var output = {};
  for (url in urlDatabase) {
    let URL = urlDatabase[url]
    if (user.id == URL.userId) {
      output[url] = URL;
    }
  }
  return output;
}


//get homepage
app.get("/urls", (request, response) => {
  var userCookie = request.session.user_id;
  var user = users[userCookie];
  var urls = urlDatabase;
  var templateVars;
  //console.log(userCookie)
  if (user) {
    var urls = getUserURL(user);
    //console.log('urls '+ urls)
    templateVars = {
      urls: urls,
      user: user
    };
    response.render("urls_index", templateVars);
  } else {
    response.redirect("/register");
  }
});


//get detail page
app.get("/urls/:id", (request, response) => {

  //READING THE COOKIE FROM THE BROWSER.
  var userCookie = request.session.user_id;
  //GET THE COMPLETE USER OBJECT FROM THE USERS DB WITH THE HELP OF COOKIE.
  var user = users[userCookie];
  var templateVars;

  var flag = false;
  if (user) {
    for (var key in urlDatabase) {
      if (urlDatabase[key].userId === user.id) {
        flag = true;
        break;
      }
    } // for loop closes
    if (flag) {
      var tempObject = urlDatabase[request.params.id];
      templateVars = {
        urls: tempObject,
        shortURL: tempObject.shortURL,
        longURL: tempObject.longURL,
        user: user
      };
      response.render("urls_show", templateVars);
    } else {
      response.send("Error, you cannot Access this URL");
    }
  } else {
    templateVars = {

      shortURL: tempObject.shortURL,
      longURL: tempObject.longURL,
      urls: urlDatabase,
      user: ""
    };
    response.render("urls_index", templateVars)
  }
});


app.listen(PORT, () => {
  console.log(`Example App Docked at port ${PORT} Capt'n`);
});