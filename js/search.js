
$( function() {


  $( "#search" ).autocomplete({
    source: function (request, response) {
      $.ajax( {
        url: "/search",
        type:'POST',
        data: {
          term: request.term
        },
        success: function( data ) {
          response($.map(data, function(item) {
                        return {
                            label: item.username,//text comes from a collection of mongo
                            value: item.username
                        };
                    }));
        },
        error: function(xhr) {
          alert(xhr.status + ' : ' + xhr.statusText);
        },
      });
    },
    minLength: 2,
    select: function( event, ui ) {
      console.log(event.username)
      //log(  ui.item.value );
    }
  });

  } );
