function sendNotification(){
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification("Benachrichtigugnen aktiviert!", {
        body: "Sie erhalten ab jetzt Benachrichtigungen für ihre Medikamente!",
        icon: "/client/public/img/icon-192.png",
        vibrate: [100,100,100],
        tag: "notifications-ready!",
      });
    });
  }

initialiseUI();

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
        fetch('/notification/subscribe', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
        });
        sendNotification();
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


var selectedMedicationCard = null;

function loadMedications() {
    fetch('/reminder/list')
        .then(response => response.json())
        .then(medications => {
            // Sortieren der Medikamente nach dem Zeitpunkt der nächsten Dosis
            medications.sort((a, b) => new Date(a.time) - new Date(b.time));
            // Füllen der Liste mit den abgerufenen Medikamenten
            for (var i = 0; i < medications.length; i++) {
                var medication = medications[i];
                addMedicationToList(medication);
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function addMedicationToList(medication) {
    // Erstellen einer neuen Karte für das Medikament
    var medicationCard = document.createElement("div");

    // Hinzufügen des data-id-Attributs mit der ID des Medikaments
    medicationCard.setAttribute("data-id", medication._id);

    medicationCard.className = "card mb-3";

    var medicationCardBody = document.createElement("div");
    medicationCardBody.className = "card-body";

    var medicationCardTitle = document.createElement("h5");
    medicationCardTitle.className = "card-title";
    medicationCardTitle.textContent = medication.name;

    var medicationCardText = document.createElement("p");
    medicationCardText.className = "card-text";
    medicationCardText.textContent = "Nächste Dosis: " + medication.dose + " am " + formatDateToCardText(medication.time);

    var editButton = document.createElement("button");
    editButton.className = "btn btn-outline-primary entry-edit";
    editButton.textContent = "Bearbeiten";
    editButton.style.marginRight = "5px";

    var deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-outline-danger entry-delete";
    deleteButton.textContent = "Löschen";

    medicationCardBody.appendChild(medicationCardTitle);
    medicationCardBody.appendChild(medicationCardText);
    medicationCardBody.appendChild(editButton);
    medicationCardBody.appendChild(deleteButton);

    medicationCard.appendChild(medicationCardBody);

    // Hinzufügen der neuen Karte zur Liste
    var medicationList = document.querySelector("#medicationList");
    medicationList.appendChild(medicationCard);

    buttonFunctionAdden();
}

function formatDateToCardText(date) {
    var date = new Date(date);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();

    if(day < 10){
        day = "0" + day;
    }
    if(month < 10){
        month = "0" + month;
    }
    if(hours < 10){
        hours = "0" + hours;
    }
    if(minutes < 10){
        minutes = "0" + minutes;
    }
    
    stringDate = day + "." + month + "." + year + " um " + hours + ":" + minutes;

    return stringDate;
}

function formatStringToDate(dateString) {
    let splits = dateString.split(".")
    let year = splits[2];
    let month = splits[1];
    let day = splits[0];
    let time = splits[3];

    if(month < 10){
        month = "0" + month;
    }

    if(day < 10){
        day = "0" + day;
    }

    let newDate = year + "-" + month + "-" + day + "T" + time;

    return newDate;
}

function formatCardTextToDate(cardText){
    let datum = cardText.split(" ")[5];
    let day = datum.split(".")[0];
    let month = datum.split(".")[1];
    let year = datum.split(".")[2];
    let time = cardText.split(" ")[7];
    let hours = time.split(":")[0];
    let minutes = time.split(":")[1];

    var medicationTime = year + "-" + month + "-" + day + "T" + hours + ":" + minutes;

    return medicationTime;
}

loadMedications();

// Medikament hinzufügen Button
document.getElementById("add_medication").addEventListener("click", function() {
    resetModal();
    $('#addMedicationModal').modal('show');
    document.getElementById('medicationName').focus();
});

// Modal Update Button
document.getElementById("entry-save").addEventListener("click", saveMedication);

function saveMedication(){
    if(allValuesFilled() == false){
        window.alert("Du hast nicht alle Felder richtig ausgefüllt!");
    } else{
        updateMedication();
    }
}

var inputs = document.getElementsByTagName("input");
for(let i = 0; i < inputs.length; i++){
    inputs[i].addEventListener("keypress", function(event){
        if (event.key == "Enter"){
            saveMedication();
        }
    })
}

// Modal schließen Button
document.getElementById("entry-close").addEventListener("click", function() {
    $('#addMedicationModal').modal('hide');
});

function allValuesFilled(){
    let medicationName = document.getElementById("medicationName").value;
    let medicationDose = document.getElementById("medicationDose").value;
    let medicationTime = document.getElementById("medicationTime").value;
    let medicationInterval = document.getElementById("medicationInterval").value;

    if(medicationName.length == 0 || medicationDose.length == 0 || medicationTime.length == 0 || medicationInterval.length == 0){
        return false;
    } else{
        return true;
    }
}

function addMedication() {
    // Abrufen der eingegebenen Informationen aus dem Modal
    var medicationName = document.getElementById("medicationName").value;
    var medicationDose = document.getElementById("medicationDose").value;
    var medicationTime = document.getElementById("medicationTime").value;
    var medicationInterval = document.getElementById("medicationInterval").value;

    if (selectedMedicationCard) {
        // Aktualisieren eines vorhandenen Medikaments
        selectedMedicationCard.querySelector(".card-title").textContent = medicationName;
        selectedMedicationCard.querySelector(".card-text").textContent = "Nächste Dosis: " + medicationDose + " am " + formatDateToCardText(medicationTime);
        selectedMedicationCard = null;
    } else {
        // Erstellen einer neuen Karte für das Medikament
        var medicationCard = document.createElement("div");
        medicationCard.className = "card mb-3";
    
        var medicationCardBody = document.createElement("div");
        medicationCardBody.className = "card-body";
    
        var medicationCardTitle = document.createElement("h5");
        medicationCardTitle.className = "card-title";
        medicationCardTitle.textContent = medicationName;
    
        var medicationCardText = document.createElement("p");
        medicationCardText.className = "card-text";
        medicationCardText.textContent = "Nächste Dosis: " + medicationDose + " am " + formatDateToCardText(medicationTime);
    
        var editButton = document.createElement("button");
        editButton.className = "btn btn-outline-primary entry-edit";
        editButton.textContent = "Bearbeiten";
        editButton.style.marginRight = "5px";
    
        var deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-outline-danger entry-delete";
        deleteButton.textContent = "Löschen";
    
        medicationCardBody.appendChild(medicationCardTitle);
        medicationCardBody.appendChild(medicationCardText);
        medicationCardBody.appendChild(editButton);
        medicationCardBody.appendChild(deleteButton);
    
        medicationCard.appendChild(medicationCardBody);
    
        // Hinzufügen der neuen Karte zur Liste
        var medicationList = document.querySelector("#medicationList");
        var medicationItems = medicationList.children;
        if(medicationItems.length > 3){
            medicationList.insertBefore(medicationCard, medicationItems[3]);
        }else{
            medicationList.appendChild(medicationCard);
        }
    }
    // Hinzufügen eines neuen Medikaments in die MongoDB
    var data = {
        name: medicationName,
        dose: medicationDose,
        time: medicationTime + ":00.000+02:00",
        interval: medicationInterval
    };
    fetch('/reminder/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        medicationCard.setAttribute("data-id", data.id);
    })
    .catch(error => {
        console.error(error);
    });

    buttonFunctionAdden();
    $('#addMedicationModal').modal('hide');
}

function buttonFunctionAdden(){
    edit_buttons = document.querySelectorAll("#medicationList .entry-edit");
    for(let i = 0; i < edit_buttons.length; i++){
        edit_buttons[i].addEventListener("click", editMedication);
    }

    delete_buttons = document.querySelectorAll("#medicationList .entry-delete")
    for(let i = 0; i < delete_buttons.length; i++){
        delete_buttons[i].addEventListener("click", deleteMedication);
    }
}

function resetModal() {
    $('#addMedicationModal').modal('hide');

    document.getElementById("medicationName").value = "";
    document.getElementById("medicationDose").value = "1 Tablette";
    
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minutes = date.getMinutes();

    if (month < 10){
        month = "0" + month;
    }

    if (day < 10){
        day = "0" + day;
    }

    if (hour < 10){
        hour = "0" + hour;
    }

    if (minutes < 10){
        minutes = "0" + minutes;
    }

    let time = year + "-" + month + "-" + day + "T" + hour + ":" + minutes;

    document.getElementById("medicationTime").value = time;
    document.getElementById("medicationInterval").value = "Einmalig";

    $('#addMedicationModal').modal('hide');

    selectedMedicationCard = null;
}

function deleteMedication(event) {
    // Abrufen des Elternelements der Karte
    var medicationCard = event.target.closest(".card");
    // Abrufen der ID des Medikaments aus dem data-id-Attribut
    var medicationId = medicationCard.getAttribute("data-id");

    // Senden einer DELETE-Anfrage an den Server
    fetch('/reminder/delete/' + medicationId, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Entfernen der Karte aus der Liste
            medicationCard.remove();
        })
        .catch(error => {
            console.error(error);
        });
}

function editMedication(event) {
    // Abrufen des Elternelements der Karte
    var medicationCard = event.target.closest(".card");
    // Abrufen der ID des Medikaments aus dem data-id-Attribut
    var medicationId = medicationCard.getAttribute("data-id");
    // Abrufen der Informationen aus der Karte
    var medicationName = medicationCard.querySelector(".card-title").textContent;
    var cardText = medicationCard.querySelector(".card-text").textContent;
    var medicationDose = cardText.split(" ")[2] + " " + cardText.split(" ")[3];
    var medicationTime = formatCardTextToDate(cardText);

    // Setzen der Werte im Modal
    document.getElementById("medicationName").value = medicationName;
    document.getElementById("medicationDose").value = medicationDose;
    document.getElementById("medicationTime").value = medicationTime;
    // Öffnen des Modals
    $('#addMedicationModal').modal('show');
    // Speichern des Elternelements der Karte in einer globalen Variable
    selectedMedicationCard = medicationCard;
}

function updateMedication() {
    // Abrufen der eingegebenen Informationen aus dem Modal
    var medicationName = document.getElementById("medicationName").value;
    var medicationDose = document.getElementById("medicationDose").value;
    var medicationInterval = document.getElementById("medicationInterval").value;
    var medicationTime = document.getElementById("medicationTime").value;

    if (!selectedMedicationCard) {
        addMedication();
    } else {
        // Aktualisieren eines vorhandenen Medikaments
        selectedMedicationCard.querySelector(".card-title").textContent = medicationName;
        selectedMedicationCard.querySelector(".card-text").textContent = "Nächste Dosis: " + medicationDose + " am " + formatDateToCardText(medicationTime);

        // Abrufen der ID des Medikaments aus dem data-id-Attribut
        var medicationId = selectedMedicationCard.getAttribute("data-id");
        // Senden einer PUT-Anfrage an den Server
        fetch('/reminder/update/' + medicationId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: medicationName,
                dose: medicationDose,
                time: medicationTime + ":00.000+02:00",
                interval: medicationInterval
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });
    }
    
    $('#addMedicationModal').modal('hide');
}