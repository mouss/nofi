
$( function() {
function location(pseudo){
  $(window).attr('location','/user/'+pseudo)
}

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
                            label: item.username,
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
      location(  ui.item.value );
    }
  });

  } );
