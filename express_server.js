const express = require('./node_modules/express');
const app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser())
const PORT = 8080;

const users = { 
  "t3st1ng": {
    id: "t3st1ng",
    name: "TestUser", 
    email: "hello@hello.com", 
    password: "123"
  },
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

//Login page
app.get("/login", (req, res) => {
  let templateVars = { user_id: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_login", templateVars);
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
  const userCheck = checkForExistingEmail(req.body.email);
  //Checks if any of the registration forms are missing(name, email, or password).
  if (!req.body.name || !req.body.email || !req.body.password) {
    res.status(400).send('You did not complete the registration form, please try again.');
    //If email isnt already registered with a user, then proceed, and create the user!
  }
  //runs the checkForExistingEmail, if it returns false, then we are good to go!
  if (userCheck === false) {
    users[userId] = newUser;
    res.cookie('user_id', userId);
    res.redirect("/urls");
    //The console logging is a safety measure. It allows you to double check if the user was added to the database or not
    console.log(newUser)
  } else {
    //if an existing email address is found, proceed to send a 400 error message
    res.status(400).send('You are already registered.');
  }
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
  let email = req.body.email;
  let password = req.body.password;
  let userEmail = checkForExistingEmail(email);
  let userCredentials = validateLogin(email, password);
  if (userEmail) {
    if (userCredentials) {
      res.cookie('user_id', userCredentials);
      res.redirect("/urls");
    } else {
      res.status(403).send('You have entered the wrong password.');
    }
  } else {
    res.status(403).send('You are not registered.');
  }
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
};
//function generateUserId() {
//  let userId = Math.random().toString(36).substring(2, 8);
//  return userId;
//}
//Helper function allows you to check for an existing email address, if it encounters it, it returns true.
function checkForExistingEmail(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId]
    }
  }
  return false
};
//Validate password
function validateLogin(email, password) {
  const checkUser = checkForExistingEmail(email)
    if (checkUser && checkUser.password === password) {
      return checkUser.id;
    }
  return false
};