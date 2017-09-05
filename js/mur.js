"use strict";
$(document).ready(function(){

  $(document).on("click", "a#poster.button.small",function(event) {
      var posting = $.post( '/postmur', {
        message: $('#message').val()
      });
      posting.done(function( data ) {
        console.log(data);
      });
  });

    $.get( "/muruser", function( data) {
      $.each( data.posts, function( index, value ) {
        console.log(value)
        $(".posts").append(
          '<div class="card news-card">'+
              '<img src="https://i.imgur.com/6jMbuU1.jpg">'+
            '<div class="card-section">'+
              '<div class="news-card-date">'+value.date+'</div>'+
                '<article class="news-card-article">'+
                  '<p class="news-card-description">'+value.message+'</p>'+
                '</article>'+
            '</div>'+
          '</div>');
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
