// Function to interpret and apply formatting rules
function interpretFormatting(text) {
  // Replace '**' with <b> for bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

  // Split the text by '*' to handle the '*' character separately
  const parts = text.split('*');

  // Iterate through the parts and format accordingly
  let formattedText = '';
  parts.forEach((part, index) => {
    // If index is even, it means the part is not between '*' characters
    if (index % 2 === 0) {
      formattedText += part;
    } else {
      // If index is odd, it means the part is between '*' characters
      formattedText += `<br><li>${part}</li>`;
    }
  });

  return formattedText;
}

// // Function to render journal entries
function renderJournalEntry(doc) {
    const data = doc.data();
    const journalEntriesDiv = document.getElementById('journal-entries');
    const entryDiv = document.createElement('div');
    entryDiv.classList.add('journal-entry');
    
    let dateString = "Invalid Date";
  
    // Check if data.date is a Firestore timestamp
    if (data.date && data.date instanceof firebase.firestore.Timestamp) {
      const dateObject = data.date.toDate(); // Convert Firebase Timestamp to JavaScript Date object
      dateString = dateObject.toLocaleString();
    }
  
    entryDiv.innerHTML = `<p><strong>Data:</strong> ${data.data}</p>
                          <p><strong>Date:</strong> ${dateString}</p>`;
    journalEntriesDiv.appendChild(entryDiv);
  }

// Fetch and display all documents from the "journal" collection, sorted by date in ascending order
journalRef.orderBy("date", "desc").get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    renderJournalEntry(doc);
    console.log(doc);
  });
}).catch((error) => {
  console.error("Error getting journal entries: ", error);
});