var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
var cookieParser = require('cookie-parser')
app.use(cookieParser())


app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies.username };
  var longURL = req.body.longURL;
  if (!req.body.longURL.includes('://')) {
    longURL = "http://" + req.body.longURL;
  }

  var randomString = generateRandomString();
  urlDatabase[randomString] = longURL;
  var shortURl = randomString;
  res.redirect('/urls/' + randomString);

});

app.post("/login", (req, res) => {
 let username = req.body.login
 res.cookie('username', username)
 res.redirect('/');
});

app.post("/urls/:id/edit/", (req, res) => {
  var username = req.cookies.username
  var key = req.params.id;
  var newUrl = req.body.longURL
  console.log(urlDatabase[req.params.id]);
  urlDatabase[req.params.id] = req.body.longURL
  //console.log(req.params.id)
  res.redirect('/urls')

});

app.post("/urls/:id/delete", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies.username };
  delete urlDatabase[req.params.id]
  console.log(req.params.id)
  res.redirect('/urls')

});

app.get("/", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_new", templateVars);
});



app.get("/urls/:id", (req, res) => {
  let key = req.params.id;
  let actualURL = urlDatabase[key];
  let templateVars = { shortURL: req.params.id, longURL: actualURL, urls: urlDatabase, username: req.cookies.username};
  res.render("urls_show", templateVars);

});

app.get("/u/:shortURL", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies.username };
  let key = req.params.shortURL
  let longURL = urlDatabase[key];
  res.redirect(longURL);
});


app.get("/hello", (req, res) => {
   let templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


console.log(generateRandomString());
