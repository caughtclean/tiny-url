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
var useremail = ""
var urlDatabase = {

  "dh67nw":
  {
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

  let templateVars = { urls: urlDatabase, userid: req.cookies.userid, email: useremail};
  var email = '';
  if (req.cookies.userid) {
    email = users[req.cookies.userid].email;
  }
  let key = req.params.id;
  let longURL = urlDatabase[req.cookies.userid].urls[key]

  if (!req.cookies.userid) {
    res.redirect('/login')
    return
  }
  res.render('urls_index', templateVars);
});

app.get("/new", (req, res) => {
  var email = '';
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid, email: useremail};
  email = users[req.cookies.userid].email;
  if (!req.cookies.userid) {
    res.redirect('/login')
    return

  };
  res.render('urls_new', templateVars)
});


// "dh67nw":
//   {
//     "urls": {
//       "f5jdn2": "www.example.com",
//       "dh2ns1": "www.example2.com"
//     }
//   }

app.post("/urls", (req, res) => {
  var email = '';
  email = users[req.cookies.userid].email;
  var longURL = req.body.longURL;
  if (!req.body.longURL.includes('://')) {
    longURL = "http://" + req.body.longURL;
  }
  var shortURL = generateRandomString();
  if (!urlDatabase[req.cookies.userid]) {
    urlDatabase[req.cookies.userid] = {"urls": {} };
  }
  urlDatabase[req.cookies.userid].urls[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect('/urls/' + shortURL);

});

app.post("/logout", (req, res) => {

  res.clearCookie('userid');
  res.redirect('/');
});

app.post("/urls/:id/edit/", (req, res) => {
  var email = '';
  email = users[req.cookies.userid].email;
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail };
  var key = req.params.id;
  var newUrl = req.body.longURL
  console.log(urlDatabase[req.params.id]);
  urlDatabase[req.cookies.userid].urls[req.params.id] = req.body.longURL
  if (!req.cookies.userid) {
    res.redirect('/login')
    return
  }
  res.redirect('/urls')

});

app.post("/urls/:id/delete", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail};
  if (!req.cookies.userid) {
    res.redirect('/login')
    return
  }
  delete urlDatabase[req.cookies.userid].urls[req.params.id]
  console.log(req.params.id)

  res.redirect('/urls')

});


// users = {
//   a46mAH:
//   { id: 'a46mAH', email: 'test@gmail.com', password: '123' },
//   XYXXX:
//   { id: 'XYXXX', email: 'test2@gmail.com', password: '123' },
// }
// req.cookies.userid == XYXXX
app.get("/", (req, res) => {
  var email = '';
  if (req.cookies.userid) {
    email = users[req.cookies.userid].email;
  }

  let templateVars = { urls: urlDatabase, userid: req.cookies.userid, email: email};
  res.render("home", templateVars);
});



app.get("/urls/:id", (req, res) => {
  var email = '';
  email = users[req.cookies.userid].email;
  let key = req.params.id;
  let longURL = urlDatabase[req.cookies.userid].urls[key]


  let templateVars = { shortURL: req.params.id, longURL: longURL, urls: urlDatabase, userid: req.cookies.userid,email: useremail};
  res.render("urls_show", templateVars);

});

app.get("/id:", (req, res) => {
  res.redirect(www.example.com)
});

app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail };
  res.render("register",templateVars)
  if (!req.cookies.userid) {
    res.redirect('/login')
    return
  }

});

app.post("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, userid: req.cookies.userid,email: useremail };
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password, 10);
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

 users[userRandomID] = {id: userRandomID, email: email, password: bcrypt.hashSync(password, 10)}
   res.cookie("userid", userRandomID )
  res.cookie("userid", userRandomID )
  //

  console.log(users)
  res.redirect("/")
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
    if (email === users[userKey].email && bcrypt.compareSync(password, users[userKey].password)) {
      res.cookie("userid", userKey)
      res.redirect("/")
      return
    }
  }

  res.status(403);
  res.send('Incorrect Username Or Password')
});

    // else {
    // (password != users[userKey].password)
    //   res.status(403);
    //   res.send('Incorrect Password')
    //   return
    // }




app.get("/u/:id", (req, res) => {
  var email = '';
  email = users[req.cookies.userid].email;
  let key = req.params.id;
  let longURL = urlDatabase[req.cookies.userid].urls[key]
  let templateVars = { shortURL: req.params.id, longURL: longURL, urls: urlDatabase, userid: req.cookies.userid,email: useremail};
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