$(document).ready(function() {
    // Öffnen des Modals beim Klicken auf den Hinzufügen-Button
    $('#add-btn').click(function() {
      $('#medicationModal').modal('show');
    });
  
    // Sammeln der Medikamenteninformationen und Schließen des Modals beim Klicken auf den Speichern-Button
    $('#entry-save').click(function() {
      const medicationName = $('#medicationName').val();
      const medicationDosage = $('#medicationDosage').val();
      const medicationTablets = $('#medicationTablets').val();
      const medicationTime = $('#medicationTime').val();
      const medicationNotes = $('#mediactionNotes').val();
  
      // Erstellen des Medikamentenobjekts
      const medication = {
        name: medicationName,
        dosage: medicationDosage,
        tablets: medicationTablets,
        time: medicationTime,
        notes: medicationNotes
      };
  
      // Senden des POST-Requests an das Backend
      fetch('/medikamente/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(medication)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Erfolg:', data);
        // Schließen des Modals
        $('#medicationModal').modal('hide');
        loadMedications();
      })
      .catch((error) => {
        console.error('Fehler:', error);
      });
    });

    // Funktion zum Laden der Medikamentenliste vom Server
    function loadMedications() {
      fetch('/medikamente/list')
      .then(response => response.json())
      .then(medications => {
        // Leeren der Medikamentenliste
        $('.medication-list').empty();
        // Hinzufügen der Medikamente zur Liste
        medications.forEach(medication => {
            $('.medication-list').append(`
              <div class="card mb-3 medication-item">
                <div class="card-body">
                 <i class="bi bi-capsule medication-icon"></i>
                  <h3 class="card-title medication-info">${medication.name}</h3>
                  <p class="card-text">Dosierung: ${medication.dosage}</p>
                  <p class="card-text">Tabletten: ${medication.tablets}</p>
                  <p class="card-text">Einnahmezeit: ${medication.time}</p>
                  <p class="card-text">Notizen: ${medication.notes}</p>
                  <i class="bi bi-pencil-square" style="font-size: 1.5rem; color: gray; float: right"></i>
                </div>
              </div>
            `);
          });          
      })
      .catch((error) => {
        console.error('Fehler:', error);
      });
    }
  
    // Laden der Medikamentenliste beim Laden der Seite
    loadMedications();
  });