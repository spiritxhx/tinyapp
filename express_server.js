const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["name"]
    // ... any other vars
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  res.redirect(`/urls/${short}`);
});

//dealing with the updating stuff
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});
app.get('/urls/:shortURL/update', (req, res) => {
  let templateVars = {
    username: req.cookies['name'],
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
    username: req.cookies['name'],
    urls: urlDatabase
  };
  console.log(req.cookies);
  res.render("urls_index", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    username: req.cookies['name'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };


  res.render('urls_show.ejs', templateVars);
});

//dealing with the delete operation
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  res.cookie('name', req.body.username);
  res.redirect('/urls');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World<b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});