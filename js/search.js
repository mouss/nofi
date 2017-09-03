
$( function() {


  } );
  function log( message ) {
    $( "<div>" ).text( message ).prependTo( "#log" );
    $( "#log" ).scrollTop( 0 );
  }

  var test= $( "#search" ).autocomplete({
    source: function (request, response) {
      $.ajax( {
        url: "/search",
        type:'POST',
        data: {
          term: request.term
        },
        success: function( data ) {
          response( data );
        }
      } );
    },
    minLength: 2,
    select: function( event, ui ) {
      console.log(event.username)
      log(  ui.item );
    },
    appendTo:"#log"
  });
