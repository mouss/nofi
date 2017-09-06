(function() {
// canUse
  window.canUse=function(p){if(!window._canUse)window._canUse=document.createElement("div");var e=window._canUse.style,up=p.charAt(0).toUpperCase()+p.slice(1);return p in e||"Moz"+up in e||"Webkit"+up in e||"O"+up in e||"ms"+up in e};

// Slideshow Background.
  (function() {
    var	$body = document.querySelector('body');
    // Settings.
      var settings = {

        // Images (in the format of 'url': 'alignment').
          images: {
            'uploads/bg1.jpg': 'center',
            'uploads/bg2.jpg': 'center',
            'uploads/bg3.jpg': 'center'
          },

        // Delay.
          delay: 6000

      };

    // Vars.
      var	pos = 0, lastPos = 0,
        $wrapper, $bgs = [], $bg,
        k, v;

    // Create BG wrapper, BGs.
      $wrapper = document.createElement('div');
        $wrapper.id = 'bg';
        $body.appendChild($wrapper);

      for (k in settings.images) {

        // Create BG.
          $bg = document.createElement('div');
            $bg.style.backgroundImage = 'url("' + k + '")';
            $bg.style.backgroundPosition = settings.images[k];
            $wrapper.appendChild($bg);

        // Add it to array.
          $bgs.push($bg);

      }

    // Main loop.
      $bgs[pos].classList.add('visible');
      $bgs[pos].classList.add('top');

      // Bail if we only have a single BG or the client doesn't support transitions.
        if ($bgs.length == 1
        ||	!canUse('transition'))
          return;

      window.setInterval(function() {

        lastPos = pos;
        pos++;

        // Wrap to beginning if necessary.
          if (pos >= $bgs.length)
            pos = 0;

        // Swap top images.
          $bgs[lastPos].classList.remove('top');
          $bgs[pos].classList.add('visible');
          $bgs[pos].classList.add('top');

        // Hide last image after a short delay.
          window.setTimeout(function() {
            $bgs[lastPos].classList.remove('visible');
          }, settings.delay / 2);

      }, settings.delay);

  })();
})();
