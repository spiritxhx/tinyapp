const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const methodOverride = require('method-override');

app.use(cookieSession({
  name: 'session',
  keys: ['Idontwanttosetupastupitkey', 'Ihavetosetupthestupitkeys'],
}));

app.use(methodOverride('_method'));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

//data for urls and users
const urlDatabase = {
  'b2xVn2': {
    userID: "userRandomID",
    longURL: "http://www.lighthouselabs.ca",
    visitTimes: 0,
    uniqueVisit: []
  },
  '9sm5xK': {
    userID: "user2RandomID",
    longURL: "http://www.google.com",
    visitTimes: 0,
    uniqueVisit: []
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    //original password is "qweasd123"
    password: '$2b$10$ZabpvwOD3mCj2HDO8YVk.eXkX.6yBopUQlT6oSi6HZ.pXJ3nP67n.'
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    //original password is "123qweasd"
    password: '$2b$10$95.oxeeHSMH373qiKdaE1uiTdR/8BN5Wymy8nEOXOw8.wZiMXlo7a'
  }
};

//root page for the application
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//main page for urls
app.get('/urls', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

//render create new shortURLS page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

//pass data to URLs update page
app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      user: users[req.session.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      times: urlDatabase[req.params.shortURL].visitTimes
    };
    if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
      res.send("You don't have the access to this resouce!");
    } else {
      res.render('urls_show.ejs', templateVars);
    }
  } else {
    res.status(404).send('Page not exist!');
  }
});

//jump to the real website
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    urlDatabase[req.params.shortURL].visitTimes++;
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(404).send('Page not exist!');
  }
});

//create new URLs
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = {};
  urlDatabase[short].longURL = req.body.longURL;
  urlDatabase[short].userID = req.session.user_id;
  urlDatabase[short].visitTimes = 0;
  urlDatabase[short].uniqueVisit = [];
  res.redirect(`/urls/${short}`);
});

//dealing with the updating stuff
app.put("/urls/:id", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
  } else if (req.session.user_id && req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.send("You don't have the access to this resouce!");
    return;
  }
  res.redirect(`/urls`);
});

//dealing with the delete operation
app.delete("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  } else if (req.session.user_id && req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.send("You don't have the access to this resouce!");
    return;
  }
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//registration page
app.get("/register", (req, res) => {
  if (!req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("register", templateVars);
  } else {
    res.redirect('/urls');
  }
});
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Email or Password cannot be Empty!');
  } else if (getUserByEmail(req.body.email, users).valid) {
    res.status(400).send("Email has been registered!!");
  } else {
    let randomId = generateRandomString();
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session['user_id'] = randomId;
    res.redirect("/urls");
  }
});

//Login
app.get("/login", (req, res) => {
  if (!req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("login", templateVars);
  } else {
    res.redirect('/urls');
  }
});
app.post("/login", (req, res) => {
  let { email, password } = req.body;
  if (getUserByEmail(email, users).valid) {
    if (bcrypt.compareSync(password, users[getUserByEmail(email, users).user].password)) {
      req.session['user_id'] = getUserByEmail(email, users).user;
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send('something wrong with email or password!');
});

//logout, clear the cookies
app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.redirect('/urls');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World<b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});