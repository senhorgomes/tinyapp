const express = require('./node_modules/express');
const app = express();
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//Apps for template, injecting text info into the code, and one for cookie encrption
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['ddb870d3e75eb646cad9ae1f1c5167a2', '6d576e63daf9125457889ce9049c5725']
}));
//Port
const PORT = process.env.PORT || 8080;

//Adding a name key isn't necessary, but it feels more personalized when you log in and see your name not "Welcome, hello@hello.com!"
const users = {
  "t3st1ng": {
    id: "t3st1ng",
    name: "TestUser",
    email: "hello@hello.com",
    password: bcrypt.hashSync('123', saltRounds)
  },
};
//Test database
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: "t3st1ng"},
  "9sm5xK": {longURL: "http://www.google.com", userId: "t3st1ng"}
};


//---------------LISTEN APPS------------------------------
 
// Trigger a listen action, on a specific port (8080) and do a callback if it worked
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//---------------GET APPS------------------------------


// If we have a GET request, asking for /urls.json, we do the callback
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Login page
app.get("/login", (req, res) => {
  const templateVars = { currentUserId: users[req.session['currentUserId']], urls: urlDatabase };
  res.render("urls_login", templateVars);
});

// Registration page
app.get("/register", (req, res) => {
  const templateVars = { currentUserId: users[req.session['currentUserId']] };
  res.render("urls_register", templateVars);
});

//Indexof all short URLs, now with a filtered function
app.get("/urls", (req, res) => {
  const cookieUserId = req.session['currentUserId'];
  const results = urlsForUser(cookieUserId);
  const templateVars = { currentUserId: users[req.session['currentUserId']], urls: results };
  res.render("urls_index", templateVars);
});


//Creation of new URL. Not the actual act of it, just the page that hosts it.
app.get("/urls/new", (req, res) => {
  const templateVars = { currentUserId: users[req.session['currentUserId']] };
  res.render("urls_new", templateVars);
});

//Instead of using /url/ the link can be found using /u/...
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
// In the event of a GET request, asking for /urls/somethingIDontKnowYet, do the callback
// :shortURL is a route parameter, accessible in req.params (like a wildcard)
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const cookieUserId = req.session['currentUserId'];
  //Checks if you are the user that created the shortURL, if not, you are routed to a 400 message.
  if (urlDatabase[shortURL].userId === cookieUserId) {
    let templateVars = { currentUserId: users[req.session['currentUserId']], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    // Render the template called urls_show, with the values of the object called templateVars
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send('You are not logged in, or authorized to edit this link.');
  }
});



//---------------POST APPS------------------------------

//Allows you to log into the server
//Uses two helper functions located below. It seems bad practice, but it allows the server to submit proper messages,tells you that you are not registered if the email doesnt match, or it will tell you the password is incorrect
app.post("/login", (req,res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userEmail = checkForExistingEmail(email);
  let userCredentials = validateLogin(email, password);
  if (userEmail) {
    if (userCredentials) {
      req.session['currentUserId'] = userCredentials;
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
  req.session['currentUserId'] = null;
  res.redirect("/urls");
});

//Register a new user
app.post("/register", (req, res) => {
  let userId = generateRandomString();
  let hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);
  const newUser = {
    id: userId,
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  };
  const userCheck = checkForExistingEmail(req.body.email);
  //Checks if any of the registration forms are missing(name, email, or password).
  if (!req.body.name || !req.body.email || !req.body.password) {
    res.status(400).send('You did not complete the registration form, please try again.');
    //If email isnt already registered with a user, then proceed, and create the user!
  }
  //runs the checkForExistingEmail, if it returns false, then we are good to go!
  if (userCheck === false) {
    users[userId] = newUser;
    res.cookie('currentUserId', userId);
    res.redirect("/urls");
    //The console logging is a safety measure. It allows you to double check if the user was added to the database or not
    console.log(users);
  } else {
    //if an existing email address is found, proceed to send a 400 error message
    res.status(400).send('You are already registered.');
  }
});

// An action script that creates a new shortURL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  const newShortURL = {
    longURL: longURL,
    userId: req.session['currentUserId']
  };
  urlDatabase[shortURL] = newShortURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//Delete a page whenever called upopn.
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  const cookieUserId = req.session['currentUserId'];
  if (urlDatabase[shortURL].userId === cookieUserId) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send('You are not logged in, or authorized to edit this link.');
  }
});
//Whenever called on, it will take in the information of the existing longURL, and allows you to edit it
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const cookieUserId = req.session['currentUserId'];
  if (urlDatabase[shortURL].userId === cookieUserId) {
    let newLongURL = req.body.longURL;
    urlDatabase[req.params.shortURL].longURL = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(400).send('You are not logged in, or authorized to edit this link.');
  }
});

//-----------Functions (to be exported and imported in future update)------------

//Chracter set uses the same format as the diceRoller to find a random number. Except this will go through the character length ot characterSet, return one number, and add it to the string. This will happen 6 times, and it will return a full string.
const generateRandomString = () => {
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
const checkForExistingEmail = (email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};
//Validate password
//Added encryption for passwords
const validateLogin = (email, password) => {
  const checkUser = checkForExistingEmail(email);
  if (checkUser && bcrypt.compareSync(password, checkUser.password)) {
    return checkUser.id;
  }
  return false;
};

// Checks user ID and returns the URLS for it
//Go through current database
//Copy the object-keys that match the user id into the new database
//display only those
const urlsForUser = (id) => {
  const filteredDatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      filteredDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredDatabase;
};