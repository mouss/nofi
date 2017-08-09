'use strict';
(function(window, io){

  window.addEventListener('DOMContentLoaded',function(){

  var socket = io('http://127.0.0.1:8080/');
  socket.emit('unEvenement', {
    message : 'test'
  });
  socket.on('unAutreEvenement', function(data){
    console.log(data);
  });



  });

})(window, io);
