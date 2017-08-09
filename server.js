/**
  Le Serveur HTTP.
  URL : http://[adresse IP/nom de domaine]:8888/
  Ce serveur produit une réponse HTTP contenant un document
  HTML suite à une requête HTTP provenant d'un client HTTP.
**/

// Chargement d'express
var express = require('express');

// Création d'un application principale express
var app = express();

var MongoClient = require('mongodb').MongoClient;
var URL = 'mongodb://localhost:27017/reseausocial';
var maDB;
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var session = require('express-session');
var bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
var userPseudo;


app.use("/pug", express.static(__dirname + '/pug'));
app.set('view engine', 'pug')
app.set('views','pug');
app.use("/img", express.static(__dirname + '/img'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));

app.use(urlencodedParser);
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret',
}));

//Mailer config
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'moussadiallo78@gmail.com',
        pass: 'mousszy78'
    }
});

// Connexion à la base de donnée Mongo
MongoClient.connect(URL, function(err, db) {
  if (err) {
    return;
  }

  maDB = db;

  // var port = process.env['PORT'] || 80;

  // Démarrage du serveur pour l'application principale express
  var server = app.listen(8080, function() {
    console.log( 'Server listening on port 8080 ');
  });

  //Page d'accueil
  app.get('/', function(req,res){
    res.render('index');
  });

  //Authentification
  app.post('/', function(req,res){
    var collection = maDB.collection('utilisateurs');
    collection.find({ username: req.body.username }).toArray(function(err, data){
      if(data == ''){
        res.render('index', {reponse:'Login invalide'});
      } else if( bcrypt.compareSync(req.body.password, data[0].password)){
        req.session.username = data[0].username;
        res.render('accueil');
      }else {
        res.render('index', {reponse:'Mot de passe invalide'});
      }
    });
  });

  //Page d'inscription
  app.get('/inscription', function(req,res){
    res.render('inscription');
  });

  //Envoie du formulaire
  app.post('/inscription', function (req, res) {
    var collection = maDB.collection('utilisateurs');
    collection.find({ username: req.body.username }).toArray(function(err, data){
        if(data == ''){
          if(req.body.password == req.body.password_confirm){
            // insertion du new User
            var hash = bcrypt.hashSync(req.body.password_confirm, 10);
            var collection = maDB.collection('utilisateurs');
            collection.insert({
              username: req.body.username,
              email: req.body.email,
              nom: req.body.nom,
              prenom: req.body.prenom,
              location: req.body.location,
              genre: req.body.genre,
              password: hash,
              niveau:'membre' })
            res.render('index', {reponse:'L\'inscription est réussi veuillez vous connectez'});
            // setup email data with unicode symbols
            let mailOptions = {
                from: '"Nofi" <contact@nofi.com>', // sender address
                to: req.body.email, // list of receivers
                subject: 'Inscription✔', // Subject line
                text: 'L\'inscription est réussi ', // plain text body
                html: '<b>L\'inscription est réussi </b>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });
          }else{
            //Retour page inscription
            res.render('inscription', {reponse:'Le mot de passe n\'est pas le même'});
          }
        }else {
          //Retour page inscription
          res.render('inscription', {reponse:'Le login existe déjà'});
        }
    });
  });

  app.get('/accueil', function(req,res){
    res.render('accueil');
  });

  //Page 404
  app.use(function(req, res, next) {
    res.status(404).render('404');
  });

  // POST /api/users gets JSON bodies
  app.post('/api/users', jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400)
    // create user in req.body
  });



  // Chargement de socket.io
  const io = require('socket.io');

  //  On utilise utilise la fonction obtenue avec notre serveur HTTP.
  var ioServer = io(server);

  /**
    Gestion de l'évènement 'connection' : correspond à la gestion
    d'une requête WebSocket provenant d'un client WebSocket.
  **/
  ioServer.on('connection', function (socket) {

    // socket : Est un objet qui représente la connexion WebSocket établie entre le client WebSocket et le serveur WebSocket.

    /**
      On attache un gestionnaire d'évènement à un évènement personnalisé 'unEvenement'
      qui correspond à un événement déclaré coté client qui est déclenché lorsqu'un message
      a été reçu en provenance du client WebSocket.
    **/
    socket.on('unEvenement', function (message) {

      // Affichage du message reçu dans la console.
      console.log(message);

      // Envoi d'un message au client WebSocket.
      socket.emit('unAutreEvenement', {texte: 'Message bien reçu !'});
      /**
        On déclare un évènement personnalisé 'unAutreEvenement'
        dont la réception sera gérée coté client.
      **/

    });

  });

});
