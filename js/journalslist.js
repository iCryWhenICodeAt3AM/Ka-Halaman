// const journalsList = db.collection("users").doc("5hjwe1KLm9lDX1mDsrY9").collection("crops").doc("APSwuEOr095VYonRRR1q").collection("journals");
const journalCollectionsDiv = document.getElementById('journal-collections'); // Assuming you have a div with id 'journal-collections' where you want to display the journal collections

// // Function to create a new journal collection
// function createNewJournal() {
//     const journalName = prompt("Enter the name of the new journal:");
//     if (journalName) {
//         const cropRef = db.collection("users").doc(userId).collection("crops").doc(cropId);
//         cropRef.collection(journalName).add({
//             timestamp: firebase.firestore.FieldValue.serverTimestamp(),
//             data: "",
//             from: "bot"
//         }).then(() => {
//             console.log("New journal created successfully!");
//             // Refresh journal collection list
//             displayJournalCollections();
//         }).catch((error) => {
//             console.error("Error creating new journal:", error);
//         });
//     }
// }
// Function to create a new journal collection
function createNewJournal() {
    console.log(`Crop Id: ${cropId}`);
    const journalName = prompt("Enter the name for the new journal:");
    if (journalName) {
        db.collection("crops")
        .doc(cropId)
        .collection("journals")
        .add({
            name: journalName, // Assuming name is the field name
            date: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then((docRef) => {
            alert("New journal created successfully!");
            const journalId = docRef.id; // Get the generated document ID
            // Display the new journal entry
            displayJournal(journalName, journalId);
        })
        .catch((error) => {
            console.error("Error creating new journal:", error);
        });
    }
}

// Function to display a journal entry
function displayJournal(journalName, journalId) {
    const contentDiv = `
        <div class="col-12 text-center mt-3 mb-3" style="cursor: pointer;">
            <div class="row">
                <div class="col-12 h3 p-3 rounded" 
                    onclick="navigateToJournal('${cropId}', '${journalId}')"
                    onmouseover="this.classList.add('bg-success'); this.classList.add('text-white');"
                    onmouseout="this.classList.remove('bg-success'); this.classList.remove('text-white');"
                    style="border: 2px solid black; border-radius: 10px;">
                    ${journalName}
                </div>
            </div>
        </div>`;
    journalCollectionsDiv.innerHTML += contentDiv;
}


// // Function to display journal collections
// function displayJournalCollections() {
//     // Clear existing collection buttons
//     journalCollectionsDiv.innerHTML = '';
    
//     db.collection("users")
//     .doc("5hjwe1KLm9lDX1mDsrY9")
//     .collection("crops")
//     .doc("APSwuEOr095VYonRRR1q")
//     .collection("journals")
//     .orderBy("date", "desc") // Sort documents by timestamp in descending order
//     .get()
//     .then((querySnapshot) => {
//         querySnapshot.forEach((doc) => {
//             // Access the document data
//             const data = doc.data();
//             // Get the name from the document data
//             const docName = data.name; // Assuming the name field exists in the document data
//             // Create a button for each document
//             const button = document.createElement('button');
//             button.textContent = docName; // Display the document name as text
//             button.className = 'journal-collection-button m-2';
//             // Add click event listener to navigate to journal.html
//             button.addEventListener('click', () => {
//                 // Redirect to journal.html with query parameter 'collection' set to docId
//                 window.location.href = `journal.html?collection=${doc.id}`;
//             });
//             // Append the button to the container
//             journalCollectionsDiv.appendChild(button);
//         });
//     })
//     .catch((error) => {
//         console.error("Error getting documents: ", error);
//     });
// }


// // Function to view journal entries inside a specific collection
// function viewJournalEntries(collectionName) {
//     // Add your logic here to display journal entries inside the specified collection
//     console.log("Viewing journal entries for collection:", collectionName);
// }

// // Call createNewJournal after fetching initial list of collections
// displayJournalCollections();