const showLocalNotification = (title, body, swRegistration) => {
  const options = {
    "//": "Visual Options",
    "body": "<String>",
    "icon": "<URL String>",
    "image": "<URL String>",
    "badge": "<URL String>",
    "vibrate": "<Array of Integers>",
    "sound": "<URL String>",
    "dir": "<String of 'auto' | 'ltr' | 'rtl'>",
    "//": "Behavioural Options",
    "tag": "<String>",
    "data": "<Anything>",
    "requireInteraction": "<boolean>",
    "renotify": "<Boolean>",
    "silent": "<Boolean>",
    "//": "Both Visual & Behavioural Options",
    "actions": "<Array of Strings>",
    "//": "Information Option. No visual affect.",
    "timestamp": "<Long>"
  };
  swRegistration.showNotification(title, options);
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');
  
    // Registrieren Sie den Service Worker
    navigator.serviceWorker.register('./serviceworker.js')
    .then(function(swReg) {
      console.log('Service Worker is registered', swReg);
  
      swRegistration = swReg;
      
      showLocalNotification("Penis", "Groß", swRegistration);

      initialiseUI();
    })
    .catch(function(error) {
      console.error('Service Worker Error', error);
    });
  } else {
    console.warn('Push messaging is not supported');
  }
  
  function initialiseUI() {
    // Überprüfen Sie die anfängliche Berechtigung
    if (Notification.permission === 'denied') {
      console.log('Push-Benachrichtigungen wurden vom Benutzer blockiert.');
      return;
    } else if(Notification.permission === 'granted') {
      console.log('Push-Benachrichtigungen vorhanden.');
    }
  
    // Fragen Sie den Benutzer um Erlaubnis, wenn die Berechtigung noch nicht erteilt wurde
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
          console.log('Berechtigung für Push-Benachrichtigungen erteilt.');
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
        console.log('Benutzer ist abonniert.');
        // Senden Sie das Abonnement an den Server
        fetch('/reminder/subscribe', {
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