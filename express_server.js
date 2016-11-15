var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
var cookieParser = require('cookie-parser')
app.use(cookieParser())
const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur";
const hashed_password = bcrypt.hashSync(password, 10);
var cookieSession = require('cookie-session')

const users = {}
var urlDatabase = {

  "dh67nw": {
    "urls": {
      "f5jdn2": "www.example.com",
      "dh2ns1": "www.example2.com"
    }
  },
  "xxks2f": {
    "urls": {
      "wwwwww": "www.example3.com",
      "xxxxxx": "www.example4.com"
    }
  }

};

app.use(cookieSession({
  name: 'session',
  keys: ['supersecret', 'supersecret2']
}))

app.use((req, res, next) => {
  if (req.session.userid) {
    res.locals.email = (users[req.session.userid] || {}).email;
  } else {
    res.locals.email = null
  }
  next();
})

app.set("view engine", "ejs");

function generateRandomString() {
  let possible = "ABCDEFGHIJKLMOPQRSTUVWXYZ123456789abcdefghijklmnopqrstuvwxyz";
  let random = "";
  for (let i = 0; i < 6; i += 1) {
    random += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return random;
}

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  if (!req.session.userid) {
    res.redirect('/login')
    return
  }
  let templateVars = { urls: ((urlDatabase[req.session.userid] || {}).urls || {}) }
  res.render('urls_index', templateVars);
});

app.get("/new", (req, res) => {
  console.log(req.session)
  let templateVars = { urls: urlDatabase, userid: req.session.userid };
  if (!req.session.userid) {
    res.redirect('/login')
    return

  };
  res.render('urls_new', templateVars)
});


app.post("/urls", (req, res) => {
  var email = '';
  email = users[req.session.userid].email;
  var longURL = req.body.longURL;
  if (!req.body.longURL.includes('://')) {
    longURL = "http://" + req.body.longURL;
  }
  var shortURL = generateRandomString();
  if (!urlDatabase[req.session.userid]) {
    urlDatabase[req.session.userid] = { "urls": {} };
  }
  urlDatabase[req.session.userid].urls[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect('/urls/' + shortURL);

});

app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect('/');
});

app.post("/urls/:id/edit/", (req, res) => {
  email = users[req.session.userid].email;
  urlDatabase[req.session.userid].urls[req.params.id] = req.body.longURL
  if (!req.session.userid) {
    res.redirect('/login')
    return
  }
  res.redirect('/urls')

});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.userid) {
    res.redirect('/login')
    return
  }
  delete urlDatabase[req.session.userid].urls[req.params.id]
  res.redirect('/urls')

});

app.get("/", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.session.userid };
  res.render("home", templateVars);
});

app.get("/urls/:id", (req, res) => {
  var email = users[req.session.userid].email;
  if (!req.session.userid) {
    res.redirect('/login')
    return
  }
  let longURL = urlDatabase[req.session.userid].urls[req.params.id]
  let templateVars = { shortURL: req.params.id, longURL: longURL, urls: urlDatabase, userid: req.session.userid };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  // If logged in, send to home page
  if (req.session.userid) {
    res.redirect('/')
    return
  }
  let templateVars = { urls: urlDatabase, userid: req.session.userid };
  res.render("register", templateVars)


});

app.post("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.session.userid };
  let email = req.body.email;
  let password = req.body.password;
  let userRandomID = generateRandomString();

  for (var userKey in users) {
    if (email === users[userKey].email) {
      res.status(400);
      res.send('Email already exsists!');
      return;
    } else if (email === "" || password === "") {
      res.status(400);
      res.send("Missing email or password field");
      return;
    }
  }

  users[userRandomID] = { id: userRandomID, email: email, password: bcrypt.hashSync(password, 10) }
  req.session.userid = userRandomID
  res.redirect("/")
});

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.session.userid };
  res.render("login", templateVars)
});

app.post("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.session.userid };
  let email = req.body.email;
  let password = req.body.password;

  for (var userKey in users) {
    if (email === users[userKey].email && bcrypt.compareSync(password, users[userKey].password)) {
      req.session.userid = userKey
      res.redirect("/")
      return
    }
  }

  res.status(403);
  res.send('Incorrect Username Or Password')
});

app.get("/u/:id", (req, res) => {
  email = users[req.session.userid].email;
  let key = req.params.id;
  let longURL = urlDatabase[req.session.userid].urls[key]
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

