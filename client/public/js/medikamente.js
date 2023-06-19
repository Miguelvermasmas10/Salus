$(document).ready(function() {
    // Öffnen des Modals beim Klicken auf den Hinzufügen-Button
    $('#add-btn').click(function() {
        // Leeren der ID
        $('#medicationId').val('');
        // Öffnen des Modals
        $('#medicationModal').modal('show');
    });
  
    // Sammeln der Medikamenteninformationen und Schließen des Modals beim Klicken auf den Speichern-Button
    $('#entry-save').click(function() {
        const medicationID = $('#medicationId').val();
        const medicationName = $('#medicationName').val();
        const medicationDosage = $('#medicationDosage').val();
        const medicationTablets = $('#medicationTablets').val();
        const medicationTime = $('#medicationTime').val();
        const medicationNotes = $('#mediactionNotes').val();
  
      // Erstellen des Medikamentenobjekts
      const updatedMedication = {
        name: medicationName,
        dosage: medicationDosage,
        tablets: medicationTablets,
        time: medicationTime,
        notes: medicationNotes
      };

      if(!medicationID){
        fetch('/medikamente/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedMedication)
        })
        .then(response => response.json())
        .then(data => {
          console.log('Erfolg:', data);
          loadMedications();
        })
        .catch((error) => {
          console.error('Fehler:', error);
        });
      }else{
        fetch('/medikamente/update/' + medicationID, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedMedication)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Erfolg:', data);
                loadMedications();
            })
            .catch(error => {
                console.error(error);
            });
      }
      resetModal();
    });

    // Funktion zum Laden der Medikamentenliste vom Server
    function loadMedications() {
        // Leeren der Medikamentenliste
        $('.medication-list').empty();
        fetch('/medikamente/list')
        .then(response => response.json())
        .then(medications => {
            // Hinzufügen der Medikamente zur Liste
            medications.forEach(medication => {
              $('.medication-list').append(`
                <div class="card mb-3 medication-item" medID="` + medication._id + `">
                  <div class="card-body">
                    <i class="bi bi-capsule medication-icon"></i>
                    <h3 class="card-title medication-info">${medication.name}</h3>
                    <p class="card-text medication-dosage">Dosierung: ${medication.dosage}</p>
                    <p class="card-text medication-tablets">Tabletten: ${medication.tablets}</p>
                    <p class="card-text medication-time">Einnahmezeit: ${medication.time}</p>
                    <p class="card-text medication-notes">Notizen: ${medication.notes}</p>
                    <a class="edit-icon" href="javascript:void(0);" onclick="func(0)"><i class="bi bi-pencil-square" style="font-size: 1.5rem; color: gray; float: right; margin-left: 10px;"></i></a>
                    <a class="delete-icon" href="javascript:void(0);" onclick="func(0)"><i class="bi bi-x-circle" style="font-size: 1.5rem; color: red; float: right;"></i></a>
                  </div>
                </div>
              `);
            });

            $('.delete-icon').click(function(){
                const medicationItem = $(this).closest('.medication-item');
                const medicationID = medicationItem.attr("medID");
            
                fetch("/medikamente/delete/" + medicationID, {
                    method: 'DELETE',
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Erfolg:', data);
                    // Entfernen des Medikamenten-Elements aus der Liste
                    medicationItem.remove();
                })
                .catch((error) => {
                    console.error('Fehler:', error);
                });
            });
            
            
            
            $('.edit-icon').click(function() {
                const medicationItem = $(this).closest('.medication-item');
                const medicationID = medicationItem.attr("medID");
                const name = medicationItem.find('.medication-info').text();
                const dosage = medicationItem.find('.medication-dosage').text().split(': ')[1];
                const tablets = medicationItem.find('.medication-tablets').text().split(': ')[1];
                const time = medicationItem.find('.medication-time').text().split(': ')[1];
                const notes = medicationItem.find('.medication-notes').text().split(': ')[1];
        
                // Ausfüllen der Formularfelder mit den Medikamenteninformationen
                $('#medicationId').val(medicationID);
                $('#medicationName').val(name);
                $('#medicationDosage').val(dosage);
                $('#medicationTablets').val(tablets);
                $('#medicationTime').val(time);
                $('#medicationNotes').val(notes);
        
                // Öffnen des Modals
                $('#medicationModal').modal('show');
            });
        })
        .catch((error) => {
            console.error('Fehler:', error);
        });
    }
    // Laden der Medikamentenliste beim Laden der Seite
    loadMedications();
  });

function resetModal() {
  $('#medicationModal').modal('hide');
  document.getElementById("medicationName").value = "";
  document.getElementById("medicationDosage").value = "";
  document.getElementById("medicationTablets").value = "";
  
  let date = new Date();
  let hour = date.getHours();
  let minutes = date.getMinutes();

  if (hour < 10){
      hour = "0" + hour;
  }

  if (minutes < 10){
      minutes = "0" + minutes;
  }

  let time = hour + ":" + minutes;

  document.getElementById("medicationTime").value = time;
  document.getElementById("medicationNotes").value = "...";
}