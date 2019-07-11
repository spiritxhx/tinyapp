const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
// const password = "purple-monkey-dinosaur"; // found in the req.params object
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers');


app.use(cookieSession({
  name: 'session',
  keys: ['Idontwanttosetupastupitkey', 'Ihavetosetupthestupitkeys'],
}));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

/////////////global functions/////////////////////
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// const getUserByEmail = email => {
//   for (const user in users) {
//     if (users[user].email === email) return { valid: true, user };
//   }
//   return { valid: false };
// };
const urlsForUser = id => {
  let urls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urls;
};
/////////////////data//////////////////////////
const urlDatabase = {
  'b2xVn2': {
    userID: "userRandomID",
    longURL: "http://www.lighthouselabs.ca"
  },
  '9sm5xK': {
    userID: "user2RandomID",
    longURL: "http://www.google.com"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: '$2b$10$ZabpvwOD3mCj2HDO8YVk.eXkX.6yBopUQlT6oSi6HZ.pXJ3nP67n.'
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: '$2b$10$95.oxeeHSMH373qiKdaE1uiTdR/8BN5Wymy8nEOXOw8.wZiMXlo7a'
  }
};
///////////////end of data////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

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

app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = {};
  urlDatabase[short].longURL = req.body.longURL;
  urlDatabase[short].userID = req.session.user_id;
  res.redirect(`/urls/${short}`);
});

//dealing with the updating stuff/////////////////////
app.post("/urls/:id/update", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
  }
  res.redirect(`/urls`);
});
app.get('/urls/:shortURL/update', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render('urls_show.ejs', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

///////////////main page for urls//////////////////
app.get('/urls', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };
  res.render("urls_index", templateVars);
});
///////////////end of main page/////////////////////


app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render('urls_show.ejs', templateVars);
});

///////dealing with the delete operation/////////////
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect('/urls');
});

/////////////////registration page/////////////////////
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
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
    // res.cookie("user_id", randomId);
    req.session['user_id'] = randomId;
    res.redirect("/urls");
  }
});

///////////////////////////////////////////////////

//Login/////////////////////////////////////////////
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render("login", templateVars);
});
app.post("/login", (req, res) => {
  let { email, password } = req.body;
  if (getUserByEmail(email, users).valid) {
    if (bcrypt.compareSync(password, users[getUserByEmail(email, users).user].password)) {
      // res.cookie('user_id', getUserByEmail(email).user);
      req.session['user_id'] = getUserByEmail(email, users).user;
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send('something wrong with email or password!');
});
//////////////////end of login/////////////////////


//logout//////////////////////////////////////////////////
app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.redirect('/urls');
});
////////////////////////////////////////////////////////////

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World<b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});