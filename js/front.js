'use strict';
(function(window, io){

  window.addEventListener('DOMContentLoaded',function(){

    var socket = io('http://127.0.0.1:8080/');
    socket.emit('unEvenement', {
      message : 'new user'
    });
    socket.on('search', function(data){
      console.log(data);
    });
    socket.on('unAutreEvenement', function(data){
      console.log(data);
    });
  });
})(window, io);
