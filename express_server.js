const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

/////////////global functions/////////////////////
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};
let randomId = generateRandomString(10);
const emailCheck = email => {
  for (const user in users) {
    if (users[user].email === email) return { valid: true, user };
  }
  return { valid: false };
};
/////////////////data//////////////////////////
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
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
};
///////////////////////////////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    users,
    userId: req.cookies['user_id']
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  res.redirect(`/urls/${short}`);
});

//dealing with the updating stuff/////////////////////
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});
app.get('/urls/:shortURL/update', (req, res) => {
  let templateVars = {
    users,
    userId: req.cookies['user_id'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show.ejs', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let templateVars = {
    users,
    userId: req.cookies['user_id'],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    users,
    userId: req.cookies['user_id'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show.ejs', templateVars);
});

//dealing with the delete operation/////////////
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

/////////////////registration page/////////////////////
app.get("/register", (req, res) => {
  let templateVars = {
    users,
    userId: req.cookies['user_id']
  };
  res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Email or Password cannot be Empty!');
  } else if (emailCheck(req.body.email).valid) {
    res.status(400).send("Email has been registered!!");
  } else {
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", randomId);
    res.redirect("/urls");
  }
});

///////////////////////////////////////////////////

//Login/////////////////////////////////////////////
app.get("/login", (req, res) => {
  let templateVars = {
    users,
    userId: req.cookies['user_id']
  };
  res.render("login", templateVars);
});
app.post("/login", (req, res) => {
  let { email, password } = req.body;
  if (emailCheck(email).valid) {
    if (users[emailCheck(email).user].password === password) {
      res.cookie('user_id', emailCheck(email).user);
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send('something wrong with email or password!');
});
///////////////////////////////////////////////////


//logout//////////////////////////////////////////////////
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});
////////////////////////////////////////////////////////////

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World<b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});