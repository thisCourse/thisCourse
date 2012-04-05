bcrypt = require "bcrypt"

passwordHashes =
  admin: "$2a$10$61P6HLPBNICLZ0aszJGQ9u9QXOEP92nPwJ1PnmY3lmxPF0mO831mq"
  test: "$2a$10$1MgFC7HUDuwKwh.1JNNeiOfYWl9xBR37dZgQyMTn91oFWLL6CM.C2"

hash_password = (password, callback) ->
  bcrypt.gen_salt 10, (err, salt) ->
    if err then callback err
    bcrypt.encrypt password, salt, callback

check_password = (password, hash, callback) ->
  bcrypt.compare password, hash, callback

# if there's an explicit token in the querystring, use that instead of the cookie token
token_middleware = (options) ->
  (req, res, next) ->
    req.auth = {}
    if req.query.token
      req.cookies.token = req.auth.token = req.query.token.replace(" ", "+")
      req.auth.explicit = true
    else
      req.auth.explicit = false
    next()

# check that the session ID was accepted, and pull out the user's email (if it exists)
user_middleware = (options) ->
  (req, res, next) ->
    if not req.auth then throw new Error "Call token_middleware before user_middleware (session middleware in between)"
    if req.auth.token==req.sessionID and req.session.email
      req.auth.email = req.session.email
    next()

hash = (req, res, next) ->
  password = req.body.password or req.query.password
  if password
    hash_password password, (err, hash)->
      res.end hash
  else
    res.end "Error: password required"

# TODO: require an explicit token for this (and logout) to prevent CSRF
login = (req, res, next) ->
  email = req.body.email or req.query.email
  password = req.body.password or req.query.password or ""
  req.session.user = ""
  if email and password
    if not passwordHashes[email] then return res.json {error: "Login failed!"}
    check_password password, passwordHashes[email], (err, valid) ->
      if valid
        req.session.regenerate (err) ->
          if err then throw err
          req.session.email = email
          res.json {email: email, token: req.sessionID}
      else
        res.json {error: "Login failed!"}, 405
  else
    res.json error: "Please specify an email address (and password)!", 400

check = (req, res, next) ->
  res.json {email: req.session.email, token: req.sessionID}

logout = (req, res, next) ->
  req.session.destroy ->
    res.end "Logged out"

module.exports =
  hash_password: hash_password
  check_password: check_password
  token_middleware: token_middleware
  user_middleware: user_middleware
  login: login
  logout: logout
  hash: hash
  check: check