const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // defalt port
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const flash = require('connect-flash');

app.set("view engine", "ejs");
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

// const urlDatabase = {
//   "1234" : "http://www.lighthouselabs.ca",
//   "2134" : "http://www.google.com"
// };

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

// for (let user in users){
//   let usersURLDatabase = {
//     users.userID: {
//       "1234" : "http://www.lighthouselabs.ca",
//       "2134" : "http://www.google.com"
//     },
//     users.userID: {
//       "2134" : "http://www.google.com"
//     }
//   };
// }


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
    var userCookie = request.cookies["user_IDCookie"];
    var user = users[userCookie];
    let templateVars = {
        email: request.cookies["user_emailCookie"],
        id: response.cookie["user_IDCookie"],
        user: user
    };
    response.render("urls_new", templateVars);
});





//delete URL
app.post("/urls/:shortURL/delete", (request, response) => {
    delete urlDatabase[request.params.shortURL]
    response.redirect("/urls");
});




//update URL
app.post("/urls/:shortURL", (request, response) => {
    let key = request.params.shortURL
    var user_IDCookie = request.cookies["user_IDCookie"];
    var tempObject = {
        shortURL: key,
        longURL: request.body.longURL,
        userId: user_IDCookie,
        // urls: urlDatabase
    };
    urlDatabase[key] = tempObject;
    console.log(urlDatabase);
   // urlDatabase[key] = request.body.longURL;
    response.redirect("/urls");
});




//get registration page
app.get("/register", (request, response) => {
    response.render('register');
});


function checkforUser(email){
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
    // let password = request.body.password
    let newUser = {
        id: key,
        email: request.body.email,
        password: request.body.password
    };
    for (user in users) {
    }
    const isUser = checkforUser(request.body.email)
      // if (user.email !== email){
      if (isUser) {
            response.send('You Are Already Registered.');
            response.status(400);
        }
        // if (request.body.email === "" || request.body.password === "") {
        //     response.send('You Shall Not Pass -____-');
        //     response.status(400);
         else {
          users[key] = newUser
          response.cookie('user_IDCookie', key)
          response.redirect("/urls");
        }
            //users[key] = newUser;
            //response.cookie('user_emailCookie', email);

            //console.log(users, email, key, user, newUser)

    });


console.log(urlDatabase)


//login
app.post("/login", (request, response) => {
    let email = request.body.email
    let isUser;
    for (let user in users) {
        const verifyUser = users[user]
        if (verifyUser.email === request.body.email) {
            isUser = verifyUser
            break
        }
    }
    if (isUser) {
        if (isUser.password === request.body.password) {
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
app.post("/logout", (request, response) => {
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
    var userCookie = request.cookies["user_IDCookie"];
    var tempObject = {
        shortURL: shortURL,
        longURL: request.body.longURL,
        userId: userCookie,
        //urls: urlDatabase[key].url
    };
    urlDatabase[shortURL] = tempObject;
    //console.log(urlDatabase)
    response.redirect(`urls/${shortURL}`);
});



function getUserURL(user){
  var output = {};
  for (url in urlDatabase){
    let URL = urlDatabase[url]
      if (user.id == URL.userId){
       output[url] = URL
      }
    }
    return output;
  }





//get homepage
app.get("/urls", (request, response) => {
  var userCookie = request.cookies["user_IDCookie"];
  var user = users[userCookie];
  console.log(userCookie)
  if (user){
    var urls = getUserURL(user)
    //console.log('urls '+ urls)

      let templateVars = {
        urls: urls,
        user: user
      };
    response.render("urls_index", templateVars);
  } else {
    response.redirect("/register")
  }
});


// const urlDatabase = {
//   "2134" : {
//     shortURL: "2134",
//     longURL: "http://www.google.com",
//     userId: "userRandomID"
//   }
// }



//get detail page
app.get("/urls/:id", (request, response) => {
  console.log("in the /urls/:id get ");
  var userCookie = request.cookies["user_IDCookie"];
  var user = users[userCookie];



  //console.log(user)
  if (user){
    console.log("user if condition true")
    //// code by rohit starts here.
      var flag = false;
      var shortKey;
      for(var key in urlDatabase){
        if(urlDatabase[key].userId === user.id){
          flag = true;
          shortKey = key;
          break;
        }
      }
      if(flag){
        var tempObject = urlDatabase[key];
        let templateVars = {
          urls: tempObject,
          shortURL: tempObject.shortURL,
          longURL: tempObject.longURL,
           user: user
        };
        response.render("urls_show", templateVars);
      } else {
          res.send("Error, you cannot Access this URL");
      }




    ///// code by rohit ends here.



    // let stagingURLObj = {}

    //   for (let key in urlDatabase) {

    //       let checkData = urlDatabase[key]

    //       if (checkData.userId === user.id) {
    //         stagingURLObj[key] = checkData
    //       };
    //       // return (checkData.shortURL + ':' + checkData.longURL)
    //   };

    //     //console.log(stagingURLObj)
    //   let templateVars = {
    //     //username: request.cookies["usernameCookie"],
    //     // shortURL: request.params.id,
    //     urls: stagingURLObj,
    //     shortURL: stagingURLObj.shortURL,
    //     longURL: stagingURLObj.longURL,
    //     user: user
    //   };
    //   console.log(templateVars);
    //   response.render("urls_show", templateVars);
    } else {
      response.render("urls_index")
    }
});


app.listen(PORT, () => {
    console.log(`Example App Docked at port ${PORT} Capt'n`);
});