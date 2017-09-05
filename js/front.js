'use strict';
(function(window, io){

  window.addEventListener('DOMContentLoaded',function(){

    var socket = io('http://127.0.0.1:5000/');
    socket.emit('unEvenement', {
      message : 'new user'
    });
    socket.on('search', function(data){
      console.log(data);
    });
    socket.on('unAutreEvenement', function(data){
      var app = new Vue({
        el: '#user',
        data: {
          nom: data.user.nom,
          prenom: data.user.prenom,
          location: data.user.location,
          photodeprofil: data.user.photodeprofil
        }
      });

    });
    socket.on('accueil', function(data){
      console.log(data);
    });
  });
  $("#poster").click(function(event) {
      event.preventDefault();
      var posting = $.post( '/postmur', {
        message: $('#message').val()
      });
      posting.done(function( data ) {
        console.log(data)
      });
    });
})(window, io);
