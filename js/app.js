$(document).foundation()
//Check if password and repassword are equal
$('input[name=password_confirm]').blur(function () {
   if ($('input[name=password]').val() != $('input[name=password_confirm]').val()) {
       $('#sign-in-form-password').removeClass().addClass('form-alert');
       $('#sign-in-form-password2').removeClass().addClass('form-alert');
   } else {
       $('#sign-in-form-password').removeClass().addClass('form-succes');
       $('#sign-in-form-password2').removeClass().addClass('form-succes');
   }
});
