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
var expressVue = require('express-vue');
const io = require('socket.io');
const path = require('path');
var generator = require('generate-password');
var multer  = require('multer');
var userPseudo={};
const vueOptions = {
    rootPath: path.join(__dirname, '/vu'),
    layout: {
        start: '<div id="app">',
        end: '</div>'
    }
};


app.use("/pug", express.static(__dirname + '/pug'));
app.set('view engine', 'pug')
app.set('views','pug');
app.use("/img", express.static(__dirname + '/img'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/uploads", express.static(__dirname + '/uploads'));

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

  //Upload Fichier
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
  },
    filename: function (req, file, cb) {
      let extArray = file.mimetype.split("/");
      let extension = extArray[extArray.length - 1];
      cb(null, file.fieldname + '-' + Date.now()+ '.' +extension)
    }
  });

  var upload = multer({ storage: storage });

  //Page d'accueil
  app.get('/', function(req,res){
    res.render('index');
  });

  //Authentification
  app.post('/accueil', function(req,res){
    var collection = maDB.collection('utilisateurs');
    collection.find({ username: req.body.username }).toArray(function(err, data){
      if(data == ''){
        res.render('index', {reponse:'Login invalide'});
      } else if( bcrypt.compareSync(req.body.password, data[0].password)){
        req.session.username = data[0].username;
        userPseudo = data[0];
        res.render('accueil',{data:data[0]});
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
          collection.find({ email: req.body.email }).toArray(function(err, data){
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
            }else{
              //Retour page inscription
              res.render('inscription', {reponse:'L\'email existe déjà'})
            }
          });

        }else {
          //Retour page inscription
          res.render('inscription', {reponse:'Le login existe déjà'});
        }
    });
  });

  //Page d'accueil
  app.get('/accueil', function(req,res){
    if(req.session.username){
      res.render('accueil');
    }else{
      res.render('index', {reponse:'Veuillez vous connectez'});
    }
  });

  //Page mes photos
  app.get('/photos', function(req,res){
    if(req.session.username){
      var collection = maDB.collection('medias');
      collection.find({ username: req.session.username }).toArray(function(err, data){
        if(data == ''){
          res.render('photos', {reponse:'Pas de photos'});
        }else{
          data.forEach(function(element) {
            res.render('photos', {data:element.fichier.gallery});
          });
        }
      });
    }else{
      res.render('index', {reponse:'Veuillez vous connectez'});
    }
  });

  var cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
  app.post('/photos', cpUpload, function(req,res){
    if (!req.body) return res.sendStatus(400)
    var collection = maDB.collection('medias');
    var date = new Date();
    collection.insert({username: req.session.username, fichier: req.files, type : 'photo', date : date})
      res.redirect('/photos')
  });

  app.get('/logout',function(req,res){
    req.session.destroy(function(err) {
      if(err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  });

  app.get('/lostpassword',function(req,res){
    res.render('lostpassword');
  });

  app.post('/lostpassword', function(req,res){
    var collection = maDB.collection('utilisateurs');
    collection.find({ email: req.body.email }).toArray(function(err, data){
      if(data == ''){
        res.render('lostpassword', {reponse:'L\'adresse e-mail n\'est pas valide'})
      }else{
        var password = generator.generate({
          length: 10,
          numbers: true
        });
        var hash = bcrypt.hashSync(password, 10);
        collection.update({email: data[0].email },{$set:{ password: hash } })
        let mailOptions = {
            from: '"Nofi" <contact@nofi.com>', // sender address
            to: req.body.email, // list of receivers
            subject: 'Mot de passe oubliée', // Subject line
            text: 'Bonjour '+ data[0].prenom +', Voici votre nouveau mot de passe:'+ password,
            html: 'Bonjour '+ data[0].prenom +',<br/>Voici votre nouveau mot de passe:<br/>'+ password // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
        res.render('index', {reponse:'Un e-mail avec votre nouveau mot de passe à etait envoyé'})
      }
    });
  });

  app.post('/search', function(req,res){
    var collection = maDB.collection('utilisateurs');
    collection.createIndex({ "username": "text" })
    collection.find({$text: { $search: req.body.search }}).toArray(function(err, data){
      if(data == ''){
        console.log('puni')
        res.render('accueil');
      }else{
        console.log(data)
        data.sort()
        res.json({resu:data})
      }
    });
  });

  app.get('/profil' ,function(req,res){
    if(req.session.username){
      var collection = maDB.collection('utilisateurs');
      collection.find({ username: req.session.username }).toArray(function(err, data){
        res.render('profil',{nom:data[0].nom, username:data[0].username, prenom:data[0].prenom, location:data[0].location, presentation:data[0].presentation, photodeprofil:data[0].photodeprofil});
      });
    }else{
      res.render('index', {reponse:'Veuillez vous connectez'});
    }
  });

  app.post('/profil', upload.single('photodeprofil'),function(req,res){
      if (!req.body) return res.sendStatus(400)
      var collection = maDB.collection('utilisateurs');
      collection.update(
        {username: req.session.username},
        {$set:{ nom:req.body.nom, prenom:req.body.prenom, location:req.body.location, presentation:req.body.presentation, photodeprofil:req.file }
      });
      userPseudo.nom = req.body.nom;
      userPseudo.prenom = req.body.prenom;
      userPseudo.location = req.body.location;
      userPseudo.presentation = req.body.presentation;
      userPseudo.photodeprofil = req.file
      res.redirect('/profil')
  });

  app.get('/listeamis' ,function(req,res){
    if(req.session.username){
      var collection = maDB.collection('amis');
      var recommander = maDB.collection('recommander');
      collection.aggregate([
          { $match : { username : req.session.username } },
          { $lookup:
             {
               from: 'utilisateurs',
               localField: 'ami',
               foreignField: 'username',
               as: 'infoami'
             }
           }
          ]).toArray(function(err, data){
            collection.aggregate([
              { $match : { ami : req.session.username } },
              { $lookup:
                 {
                   from: 'utilisateurs',
                   localField: 'username',
                   foreignField: 'username',
                   as: 'demandeur'
                 }
               }
            ]).toArray(function(err, demandeur){
              recommander.aggregate([
                { $match : { amireceveur : req.session.username } },
                { $lookup:
                   {
                     from: 'utilisateurs',
                     localField: 'amirecommander',
                     foreignField: 'username',
                     as: 'amirecommander'
                   }
                 }
              ]).toArray(function(err, recommander){
                res.render('amis', {
                    data:data,
                    demandeur:demandeur,
                    usernamesession:req.session.username,
                    recommander:recommander
                  });
              });
            });
          });
    }else{
      res.render('index', {reponse:'Veuillez vous connectez'});
    }
  });

  app.get('/ajoutamis' ,function(req,res){
    if(req.session.username){
      var mesamis = [req.session.username]
      var collection = maDB.collection('utilisateurs');
      var amis = maDB.collection('amis');
      amis.find({ ami:req.session.username }).toArray(function(err, data){
        data.forEach(function(element) {
          mesamis.push(element.username);
        });
        amis.find({ username:req.session.username }).toArray(function(err, amidata){
          amidata.forEach(function(element) {
            mesamis.push(element.ami);
          });
          console.log(mesamis)
          collection.find({ username: { $nin:mesamis } }).toArray(function(err, data){
              res.render('ajoutamis', {data:data});
          });
        });
      });

    }else{
      res.render('index', {reponse:'Veuillez vous connectez'});
    }
  });

  //Ajout Ami
  app.get('/ajoutamis/:username' ,function(req,res){
    var collection = maDB.collection('utilisateurs');
    var amis = maDB.collection('amis');
    if(req.session.username){
      amis.insert({username: req.session.username, ami: req.params.username, status: 1})
      collection.find({ username: req.params.username }).toArray(function(err, data){
        console.log(data[0]);
        let mailOptions = {
            from: '"Nofi" <contact@nofi.com>', // sender address
            to: data[0].email, // list of receivers
            subject: 'Un nouvel ami ?', // Subject line
            text: 'Bonjour '+ data[0].prenom +', L\'utilisateurs '+ req.params.username +' veut être votre amis sur Nofi' ,
            html: 'Bonjour '+ data[0].prenom +',<br/> L\'utilisateurs '+ req.params.username +' veut être votre amis sur Nofi'
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
      });
      res.redirect('/ajoutamis');
    }else{
      res.render('index', {reponse:'Veuillez vous connectez'});
    }
  });

  //Valider un Ami
  app.get('/validerami/:username' ,function(req,res){
    var amis = maDB.collection('amis');
    if(req.session.username){
      amis.updateOne({username: req.params.username, ami: req.session.username },{$set:{ status: 2} });
      res.redirect('/listeamis');
    }else{
      res.render('index', {reponse:'Veuillez vous connectez'});
    }
  });

  //Ignorer un Ami
  app.get('/ignorerami/:username' ,function(req,res){
    var amis = maDB.collection('amis');
    if(req.session.username){
      amis.updateOne({username: req.params.username, ami: req.session.username},{$set:{ status: 3} });
      res.redirect('/listeamis');
    }else{
      res.render('index', {reponse:'Veuillez vous connectez'});
    }
  });

  //Liste pour recommander amis
  app.get('/recommander' ,function(req,res){
    if(req.session.username){
      var amis = maDB.collection('amis');
      amis.aggregate([
          { $match : { username : req.session.username, status: 2 } },
          { $lookup:
             {
               from: 'utilisateurs',
               localField: 'ami',
               foreignField: 'username',
               as: 'infoami'
             }
           }
          ]).toArray(function(err, data){
            amis.aggregate([
              { $match : { ami : req.session.username, status: 2 } },
              { $lookup:
                 {
                   from: 'utilisateurs',
                   localField: 'username',
                   foreignField: 'username',
                   as: 'demandeur'
                 }
               }
            ]).toArray(function(err, demandeur){
                res.json({data:data, demandeur:demandeur, usernamesession:req.session.username});
            });
          });
    }else{
      res.render('index', {reponse:'Veuillez vous connectez'});
    }
  });

  //Ami recommander
  app.get('/recommander/:datauser/:recommander' ,function(req,res){
    if(req.session.username){
      var collection = maDB.collection('recommander');
      collection.insert({recommandeur: req.session.username, amireceveur: req.params.datauser, amirecommander:req.params.recommander, status: 1})
      res.redirect('/listeamis')
    }else{
      res.render('index', {reponse:'Veuillez vous connectez'});
    }
  });

  //Ignorer recommandation
  app.get('/ignorerecommandation/:amirecommander' ,function(req,res){
    if(req.session.username){
      var collection = maDB.collection('recommander');
      collection.updateOne({amireceveur: req.session.username, amirecommander:req.params.amirecommander},{$set:{ status: 3} })
      res.redirect('/listeamis')
    }else{
      res.render('index', {reponse:'Veuillez vous connectez'});
    }
  });

  //Accepter recommandation
  app.get('/accepterreco/:amirecommander' ,function(req,res){
    if(req.session.username){
      var collection = maDB.collection('recommander');
      collection.updateOne({amireceveur: req.session.username, amirecommander:req.params.amirecommander},{$set:{ status: 2} })
      res.redirect('/validerami/'+req.params.amirecommander)
    }else{
      res.render('index', {reponse:'Veuillez vous connectez'});
    }
  });
  // POST /api/users gets JSON bodies
  app.post('/api/users', jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400)
    // create user in req.body
  });

  var ioServer = io(server);
  ioServer.on('connection', function (socket) {

    var user = {
      username:userPseudo.username,
      prenom:userPseudo.prenom,
      nom:userPseudo.nom,
      location: userPseudo.location,
      genre: userPseudo.genre,
      niveau:userPseudo.niveau,
      photodeprofil:userPseudo.photodeprofil
    };
    socket.on('unEvenement', function (message) {


      // Affichage du message reçu dans la console.
      console.log(message);

      // Envoi d'un message au client WebSocket.
      socket.emit('unAutreEvenement', {user});
      /**
        On déclare un évènement personnalisé 'unAutreEvenement'
        dont la réception sera gérée coté client.
      **/

    });


  });
  //Page 404
  app.use(function(req, res, next) {
    res.status(404).render('404');
  });

});
