if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('serviceworker.js')
    .then((register) => console.log('Service Worker Registered'))
    .catch((err) => console.log('Service Worker Failed to Register', err));
}

function includeNavbar() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'navbar.html', true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var navbarHTML = xhr.responseText;
      var navbarContainer = document.createElement('div');
      navbarContainer.innerHTML = navbarHTML;

      checkAuthentication()
        .then(isAuthenticated => {
          if (isAuthenticated) {
            // Entferne den "Registrieren" und "Anmelden" Link
            var registerLink = navbarContainer.querySelector('a[href="registrieren"]');
            var loginLink = navbarContainer.querySelector('a[href="anmelden"]');
            if (registerLink) {
              registerLink.parentNode.removeChild(registerLink);
            }
            if (loginLink) {
              loginLink.parentNode.removeChild(loginLink);
            }
          } else {
            // Entferne den "Abmelden" und "Profil" Link
            var dokumenteLink = navbarContainer.querySelector('a[href="dokumente"]');
            if (dokumenteLink) {
              dokumenteLink.parentNode.removeChild(dokumenteLink);
            }
            var profilLink = navbarContainer.querySelector('a[href="profil"]');
            if (profilLink) {
              profilLink.parentNode.removeChild(profilLink);
            }
            var logoutLink = navbarContainer.querySelector('a[href="abmelden"]');
            if (logoutLink) {
              logoutLink.parentNode.removeChild(logoutLink);
            }
          }

          // Markiere das aktuelle nav-item als "active"
          var currentPath = window.location.pathname;
          var navLinks = navbarContainer.querySelectorAll('.nav-link');
          navLinks.forEach(function (link) {
            var linkPath = link.getAttribute('href');
            if ('/' + linkPath ===  currentPath) {
              link.parentElement.classList.add('active');
            }
          });

          // Füge die Navbar in den body-Bereich jeder HTML-Seite ein
          document.querySelectorAll('body').forEach(function (element) {
            element.insertAdjacentHTML('afterbegin', navbarContainer.innerHTML);
          });
        })
        .catch(error => {
          console.error(error);
          // Fehlerbehandlung
        });
    }
  };
  xhr.send();
}
function checkAuthentication() {
  // Überprüfe den Status über eine GET-Anfrage an den Server
  return fetch('/profil/status', {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => {
      if (data.message && data.message === 'Nicht autorisiert') {
        return false;
      } else {
        return true;
      }

    })
    .catch(error => {
      console.error(error);
      return false;
    });
}
window.addEventListener('DOMContentLoaded', function() {
  includeNavbar();
  checkAuthentication() 
});