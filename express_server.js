const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // defalt port


app.set("view engine", "ejs");

const urlDatabase = {
  "1234" : "http://www.lighthouselabs.ca",
  "2134" : "http://www.google.com"
};



app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);
});

app.get("/urls/:id", (request, response) => {
  let templateVars = {shortURL: request.params.id, urls: urlDatabase, port: PORT};
  response.render("urls_show", templateVars);
});


app.listen(PORT, () =>{
  console.log(`Example App Docked at port ${PORT} Capt'n`);
});