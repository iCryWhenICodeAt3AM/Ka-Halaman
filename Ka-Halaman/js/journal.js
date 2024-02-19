// Function to interpret and apply formatting rules
function interpretFormatting(text) {
  // Replace '**' with <b> for bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  
  // Replace '*' with <li> for bullet points
  text = text.replace(/\*(.*?)\*/g, '<li>$1</li>');
  
  return text;
}

// Function to render journal entries
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

  // Apply formatting to the data part
  const formattedData = interpretFormatting(data.data);

  entryDiv.innerHTML = `<p><strong>Data:</strong> ${formattedData}</p>
                        <p><strong>Date:</strong> ${dateString}</p>`;
  journalEntriesDiv.appendChild(entryDiv);
}

// Fetch and display all documents from the "journal" collection
journalRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
    renderJournalEntry(doc);
    console.log(doc);
    });
}).catch((error) => {
    console.error("Error getting journal entries: ", error);
});
