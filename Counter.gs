function updateFormTitle() {
  var form = FormApp.openById('1Ns4Gjiw8NV4ALqtHVWmfNrP7TKekzQdgy-jmQbAkPW0'); //THE LINK TO THE RIGHT IS THE SPECEFIC LINK FOR EACH FORM
  var responses = form.getResponses();
  var totalSpots = 5; // Set your total spots here
  var remainingSpots = totalSpots - responses.length;
  //form.setTitle("Test" + remainingSpots)



  Logger.log('Remaining Spots: ' + remainingSpots);

  if (remainingSpots <= 0) {
    form.setAcceptingResponses(false); // Close the form
    form.setTitle('Form Closed - No Spots Left'); //Change "Form Closed" to title of site
    form.setCustomClosedFormMessage('This site is full, please sign up for another site!!!')
    Logger.log('Form Closed - No Spots Left');
  } else {
    form.setTitle('TITLE OF SITE ' + remainingSpots + "/5"); //SET TITLE HERE TOO
    Logger.log('Title Updated to: Spots Left: ' + remainingSpots);
  }
}

function createTrigger() {
  ScriptApp.newTrigger('updateFormTitle')
           .timeBased()
           .everyMinutes(1)
           .create();
}
