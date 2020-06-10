const express = require('./node_modules/express');
const app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser())
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// If we have a GET request asking for the path of '/', do the callback
app.get("/", (req, res) => {
  res.send("Hello!");
});
// Trigger a listen action, on a specific port (8080) and do a callback if it worked
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
// If we have a GET request, asking for /urls.json, we do the callback
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
// An action script that creates a new shortURL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Indexof all short URLs
app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});
//Creation of new URL. Not the actual act of it, just the page that hosts it.
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});
//Delete a page whenever called upopn.
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
//Allows you to log into the server
app.post("/login", (req,res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
//Allows user to logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

//Whenever called on, it will take in the information of the existing longURL, and allows you to edit it
app.post("/urls/:shortURL", (req, res) => {
  let longURL = req.body.longURL
  urlDatabase[req.params.shortURL] = longURL;
  res.redirect("/urls");
})
// In the event of a GET request, asking for /urls/somethingIDontKnowYet, do the callback
// :shortURL is a route parameter, accessible in req.params (like a wildcard)
app.get("/urls/:shortURL", (req, res) => {
  // Declare an object called templateVars
  // Populate the object with : the value of req.params.shortURL, in the key called shortURL
  // Populate the object with : the value of the urlDatabse, at the key of req.params.shortURL, in the key called longURL
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // Render the template called urls_show, with the values of the object called templateVars
  res.render("urls_show", templateVars);
});

//Instead of using /url/ the link can be found using /u/...
app.get("/u/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL, templateVars);
});
//Chracter set uses the same format as the diceRoller to find a random number. Except this will go through the character length ot characterSet, return one number, and add it to the string. This will happen 6 times, and it will return a full string.
function generateRandomString() {
  let url = "";
  const characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    url += characterSet.charAt(Math.floor(Math.random() * characterSet.length));
  }
  return url;
}