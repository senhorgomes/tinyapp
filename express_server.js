const express = require('./node_modules/express');
const app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser())
const PORT = 8080;

const users = { 
  "userRandomID": {
    id: "userRandomID",
    name: "Bruno", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    name: "Bruno",  
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//---------------LISTEN APPS------------------------------
 
// Trigger a listen action, on a specific port (8080) and do a callback if it worked
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//---------------GET APPS------------------------------


// If we have a GET request asking for the path of '/', do the callback
app.get("/", (req, res) => {
  res.send("Hello!");
});

// If we have a GET request, asking for /urls.json, we do the callback
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Indexof all short URLs
app.get("/urls", (req, res) => {
  let templateVars = { user_id: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});
//Creation of new URL. Not the actual act of it, just the page that hosts it.
app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});
// Registration page
app.get("/register", (req, res) => {
  let templateVars = { user_id: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
})

//Instead of using /url/ the link can be found using /u/...
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
// In the event of a GET request, asking for /urls/somethingIDontKnowYet, do the callback
// :shortURL is a route parameter, accessible in req.params (like a wildcard)
app.get("/urls/:shortURL", (req, res) => {
  // Declare an object called templateVars
  // Populate the object with : the value of req.params.shortURL, in the key called shortURL
  // Populate the object with : the value of the urlDatabse, at the key of req.params.shortURL, in the key called longURL
  let templateVars = { user_id: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // Render the template called urls_show, with the values of the object called templateVars
  res.render("urls_show", templateVars);
});



//---------------POST APPS------------------------------

//Register a new user
app.post("/register", (req, res) => {
  let userId = generateRandomString();
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  }
  //Checks if email or password is missing.
  if (!req.body.name || !req.body.email || !req.body.password) {
    res.status(400).send('You did not fill out the registration form');
  }
  users[userId] = newUser;
  res.cookie('user_id', userId);
  res.redirect("/urls");
  console.log(newUser)
});

// An action script that creates a new shortURL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Allows you to log into the server
app.post("/login", (req,res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
//Allows user to logout from server by clearing cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})
//Delete a page whenever called upopn.
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
//Whenever called on, it will take in the information of the existing longURL, and allows you to edit it
app.post("/urls/:shortURL", (req, res) => {
  let longURL = req.body.longURL
  urlDatabase[req.params.shortURL] = longURL;
  res.redirect("/urls");
})

//-----------Functions (to be exported and imported in future update)------------

//Chracter set uses the same format as the diceRoller to find a random number. Except this will go through the character length ot characterSet, return one number, and add it to the string. This will happen 6 times, and it will return a full string.
function generateRandomString() {
  let url = "";
  const characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    url += characterSet.charAt(Math.floor(Math.random() * characterSet.length));
  }
  return url;
}
//function generateUserId() {
//  let userId = Math.random().toString(36).substring(2, 8);
//  return userId;
//}