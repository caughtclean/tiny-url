var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
var cookieParser = require('cookie-parser')
app.use(cookieParser())
var cookieSession = require('cookie-session')
const users = {}
const userid = users.id
var useremail = ""
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.use(cookieSession({
  name: 'session',
  keys: ['supersecret', 'supersecret2']
}))


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
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail};
  res.render('urls_index', templateVars);
});

app.get("/new", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail};
  res.render('urls_new', templateVars);
});

app.post("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid};
  var longURL = req.body.longURL;
  if (!req.body.longURL.includes('://')) {
    longURL = "http://" + req.body.longURL;
  }

  var randomString = generateRandomString();
  urlDatabase[randomString] = longURL;
  var shortURl = randomString;
  res.redirect('/urls/' + randomString);

});


app.post("/logout", (req, res) => {

  res.clearCookie('userid');
  res.redirect('/');
});

app.post("/urls/:id/edit/", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail };
  var key = req.params.id;
  var newUrl = req.body.longURL
  console.log(urlDatabase[req.params.id]);
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect('/urls')

});

app.post("/urls/:id/delete", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail};
  delete urlDatabase[req.params.id]
  console.log(req.params.id)
  res.redirect('/urls')

});

app.get("/", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid, email: useremail};
  res.render("home", templateVars);
});



app.get("/urls/:id", (req, res) => {
  let key = req.params.id;
  let actualURL = urlDatabase[key];
  let templateVars = { shortURL: req.params.id, longURL: actualURL, urls: urlDatabase, userid: req.cookies.userid,email: useremail};
  res.render("urls_show", templateVars);

});

app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail };
  res.render("register",templateVars)

});

app.post("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail };
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

  users[userRandomID] = {id: userRandomID, email: email, password: password}
  //

  console.log(users)
  res.redirect("/login")
});

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail };
  res.render("login",templateVars)
});

app.post("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail };
  let email = req.body.email;
  let password = req.body.password;

  for (var userKey in users) {
    if (email === users[userKey].email && password === users[userKey].password) {
    res.cookie("userid", userKey)
    useremail = email
    res.redirect("/")
    return
    }
    if (password != users[userKey].password) {
      res.status(403);
      res.send('Incorrect Username Or Password')
    }

    // else {
    // (password != users[userKey].password)
    //   res.status(403);
    //   res.send('Incorrect Password')
    //   return
    // }
  }

  });




app.get("/u/:shortURL", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail };
  let key = req.params.shortURL
  let longURL = urlDatabase[key];
  res.redirect(longURL);
});


app.get("/hello", (req, res) => {
   let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail };
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

console.log(users)