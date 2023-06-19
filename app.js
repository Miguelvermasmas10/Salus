function includeNavbar() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/client/public/navbar.html', true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var navbarHTML = xhr.responseText;
      var navbarContainer = document.createElement('div');
      navbarContainer.innerHTML = navbarHTML;

      checkAuthentication()
        .then(isAuthenticated => {
          if (isAuthenticated) {
            // Entferne den "Registrieren" und "Anmelden" Link
            var registerLink = navbarContainer.querySelector('a[href="/registrieren"]');
            var loginLink = navbarContainer.querySelector('a[href="/anmelden"]');
            if (registerLink) {
              registerLink.parentNode.removeChild(registerLink);
            }
            if (loginLink) {
              loginLink.parentNode.removeChild(loginLink);
            }
          } else {
            // Entferne den "Abmelden" und "Profil" Link
            var medikamenteLink = navbarContainer.querySelector('a.nav-link[href="/medikamente"]');
            if (medikamenteLink) {
              medikamenteLink.parentNode.removeChild(medikamenteLink);
            }
            var dokumenteLink = navbarContainer.querySelector('a[href="/dokumente"]');
            if (dokumenteLink) {
              dokumenteLink.parentNode.removeChild(dokumenteLink);
            }
            var erinnerungenLink = navbarContainer.querySelector('a[href="/erinnerungen"]');
            if (erinnerungenLink) {
              erinnerungenLink.parentNode.removeChild(erinnerungenLink);
            }
            var profilLink = navbarContainer.querySelector('a[href="/profil"]');
            if (profilLink) {
              profilLink.parentNode.removeChild(profilLink);
            }
            var logoutLink = navbarContainer.querySelector('a[href="/abmelden"]');
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
  checkAuthentication();
});


if ('serviceWorker' in navigator && 'PushManager' in window) {
  checkAuthentication().then(function(auth){
    if(auth){
      console.log('Service Worker and Push is supported, mein Freund!');
      // Registrieren Sie den Service Worker
      navigator.serviceWorker.register('/serviceworker.js')
      .then(function(swReg) {
        console.log('Service Worker is registered', swReg);
        swRegistration = swReg;
        initialiseUI();
      })
      .catch(function(error) {
        console.error('Service Worker Error', error);
      });
    }
  }).catch(function(){
    console.error("Error: ", err);
  });
} else {
  console.warn('Push messaging is not supported');
}


function initialiseUI() {
// Überprüfen Sie die anfängliche Berechtigung
if (Notification.permission === 'denied') {
  console.log('Push-Benachrichtigungen wurden vom Benutzer blockiert.');
  return;
}

// Fragen Sie den Benutzer um Erlaubnis, wenn die Berechtigung noch nicht erteilt wurde
  if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(function(permission) {
      if (permission === 'granted') {
          subscribeUserToPush();
      } else {
          console.log('Berechtigung für Push-Benachrichtigungen abgelehnt.');
      }
    });
  }
}

function subscribeUserToPush() {
  navigator.serviceWorker.ready.then(function(registration) {
      if (!registration.pushManager) {
      console.log('Dieser Browser unterstützt keine Push-Benachrichtigungen.');
      return;
      }
      // Erstellen Sie ein Push-Abonnement
      registration.pushManager.subscribe({
      userVisibleOnly: true, // Die Benachrichtigung muss für den Benutzer sichtbar sein
      applicationServerKey: urlBase64ToUint8Array('BIzDewgUnFBMdyO-GzzoRrnBqcH4VZrW7q6mVFYDlzmcCSuPznIRo6Qnjdf8-_Fgb5MJ_hEVvVoaYs-mwIob3WA')
      }).then(function(subscription) {
      // Senden Sie das Abonnement an den Server
      fetch('/profil/subscribe', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json'
          },
          body: JSON.stringify(subscription)
      });
      }).catch(function(error) {
      console.error('Fehler beim Abonnieren des Benutzers', error);
      });
  }).catch(error => function(){
      console.log("error: ", error);
  });
}

// Hilfsfunktion zum Konvertieren der Basis64-URL in eine Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}