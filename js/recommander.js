'use strict';

$( document ).ready(function() {
  $.get( "/recommander", function( data) {
    console.log(data)
    if(data.data != ''){
      $.each( data.data, function( index, value ) {
        $(document).on("click", ".button.success.small", function () {
           var dataUser = $(this).data('user');
           if(value.infoami[0].username != dataUser){
             $(".lead").html(
               '<div class="blogpost-footer-author-section">'+
                     '<img class="avatar" src='+value.infoami[0].photodeprofil.path+' alt="" />'+
                       '<p class="author"><i class="fa fa-user-o" aria-hidden="true"></i> '+value.ami+'<br><i class="fa fa-map-marker" aria-hidden="true"></i> '+value.infoami[0].location+'</p>'+
                 '<a href="/recommander/'+dataUser+'/'+value.ami+'" class="hollow button success"><i class="fa fa-user-plus" aria-hidden="true"></i> Recommander</a>'+
               '</div>'
             );
           }
        });

      });
    }else if (data.demandeur != '') {
      console.log(2)
      $.each( data.demandeur, function( index, value ) {
        $(document).on("click", ".button.success.small", function () {
          var dataUser = $(this).data('user');
          if(value.demandeur[0].username != dataUser){
            $(".lead").html(
              '<div class="blogpost-footer-author-section">'+
                    '<img class="avatar" src='+value.demandeur[0].photodeprofil.path+' alt="" />'+
                      '<p class="author"><i class="fa fa-user-o" aria-hidden="true"></i> '+value.username+'<br><i class="fa fa-map-marker" aria-hidden="true"></i> '+value.demandeur[0].location+'</p>'+
                '<a href="/recommander/'+dataUser+'/'+value.username+'" class="hollow button success"><i class="fa fa-user-plus" aria-hidden="true"></i> Recommander</a>'+
              '</div>'
            );
          }
        });


      });
    }else {
      $.each( data.data, function( index, value ) {
          $(".lead").html(
            '<div class="blogpost-footer-author-section">'+
                  '<img class="avatar" src='+value.infoami[0].photodeprofil.path+' alt="" />'+
                    '<p class="author"><i class="fa fa-user-o" aria-hidden="true"></i> '+value.ami+'<br><i class="fa fa-map-marker" aria-hidden="true"></i> '+value.infoami[0].location+'</p>'+
              '<a href="" class="hollow button success"><i class="fa fa-user-plus" aria-hidden="true"></i> Recommander</a>'+
            '</div>'
          );
      });
      $.each( data.demandeur, function( index, value ) {
          $(".lead").html(
            '<div class="blogpost-footer-author-section">'+
                  '<img class="avatar" src='+value.demandeur[0].photodeprofil.path+' alt="" />'+
                    '<p class="author"><i class="fa fa-user-o" aria-hidden="true"></i> '+value.username+'<br><i class="fa fa-map-marker" aria-hidden="true"></i> '+value.demandeur[0].location+'</p>'+
              '<a href="#" class="hollow button success"><i class="fa fa-user-plus" aria-hidden="true"></i> Recommander</a>'+
            '</div>'
          );

      });
    }
  });


});
