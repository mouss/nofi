"use strict";
$(document).ready(function(){
var username = $(location).attr('pathname');
  $(document).on("click", "a#poster.button.small",function(event) {
      var posting = $.post( '/postmur/'+username.split('/')[2], {
        message: $('#message').val()
      });
      posting.done(function( data ) {
        console.log(data);
      });
  });


    $.get( "/muruser/"+username.split('/')[2], function( data) {
      $.each( data.posts, function( index, value ) {
        console.log(value)
        $(".posts").prepend(
          '<div class="card news-card">'+
            '<div class="card-section">'+
              '<div class="news-card-date">'+value.date+'</div>'+
                '<article class="news-card-article">'+
                  '<p class="news-card-description">'+value.message+'</p>'+
                '</article>'+
            '</div>'+
            '<div class="news-card-author">'+
               '<div class="news-card-author-name">'+
                 'By <a href="/user/'+value.muruser+'">'+value.muruser+'</a>'+
               '</div>'+
             '</div>'+
            '</div>'
          );
      });
    });
});
/*  <img src="https://i.imgur.com/6jMbuU1.jpg">
  <div class="card-section">
    <div class="news-card-date">Sunday, 16th April</div>
    <article class="news-card-article">
      <h4 class="news-card-title"><a href="#">5 Features To Watch Out For in Angular v4</a></h4>
      <p class="news-card-description">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae facere, ipsam quae sit, eaque perferendis commodi!...</p>
    </article>
    <div class="news-card-author">
      <div class="news-card-author-image">
        <img src="https://i.imgur.com/lAMD2kS.jpg" alt="user">
      </div>
      <div class="news-card-author-name">
        By <a href="#">Harry Manchanda</a>
      </div>
    </div>
  </div>
</div>
*/
