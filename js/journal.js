// Get the collection value from the URL parameter
const urlParams = new URLSearchParams(window.location.search);
const collection = urlParams.get('collection');
console.log(collection);
const journalRef = db.collection("users")
    .doc(userId)
    .collection("crops")
    .doc(cropId)
    .collection("journals")
    .doc(collection)
    .collection("saves"); // Access the specific document within "journals".collection("saves");
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
  
  entryDiv.innerHTML = `<div class="container">
                          <div class="row">
                            <div class="col-12">
                              <p><strong>Date:</strong> ${dateString}</p>
                            </div>
                            <div class="col-12">
                              <p><strong>Data:</strong> ${data.data}</p>
                            </div>
                            <div class="col-12">
                              <p><strong>Comment:</strong> ${data.comment ? data.comment : ''}</p>
                            </div>
                            <div class="col-12">
                              <div class="row m-3">
                                <div class="col-3 offset-2">
                                  <button type="button" id="${doc.id}-comment" class="btn btn-success btn-sm" onclick="toggleComment('${doc.id}', '${data.comment ? data.comment : ''}')">Comment</button>
                                </div>
                                <div class="col-3 offset-2">
                                  <button type="button" class="btn btn-danger btn-sm" id="${doc.id}-delete" onclick="deleteJournalEntry('${doc.id}')">Delete</button>
                                </div>
                                <div class="col-2"></div>
                              </div>
                              <div id="${doc.id}-comment-section" class="col-12"></div> <!-- Added col-12 for the comment section -->
                            </div>
                          </div>`;
  journalEntriesDiv.appendChild(entryDiv);
}


// Function to toggle comment section
function toggleComment(docId, comment) {
  const commentSection = document.getElementById(`${docId}-comment-section`);
  const commentButton = document.getElementById(`${docId}-comment`);
  const existingComment = commentSection.querySelector('textarea');

  if (existingComment) {
    // User clicked "Done" button
    const commentValue = existingComment.value.trim();
    if (commentValue !== '') {
      // Disable the "Done" button
      commentButton.disabled = true;
      // Change button text to "Saving..."
      commentButton.textContent = 'Saving...';
      // Save comment to Firestore document
      saveComment(docId, commentValue);
    } else {
      // Remove comment textarea if it's empty
      commentSection.innerHTML = '';
      // Change button text back to "Comment"
      commentButton.textContent = 'Comment';
    }
  } else {
    // User clicked "Comment" button
    // Create textarea for adding comment
    const textarea = document.createElement('textarea');
    textarea.classList.add('form-control');
    textarea.value = comment ? comment : ''; // Populate with existing comment if available
    commentSection.appendChild(textarea);
    // Change button text to "Done"
    commentButton.textContent = 'Done';
  }
}

// Function to save comment to Firestore document
function saveComment(docId, comment) {
  // Check if the comment is defined and not empty
  if (!comment || comment.trim() === '') {
    console.error("Invalid comment.");
    return;
  }

  // Check if the document exists
  journalRef.doc(docId).get().then((doc) => {
    if (doc.exists) {
      // Merge the new comment with existing data
      const updatedData = { comment: comment.trim(), ...doc.data() };

      // Update or set the data in the document
      journalRef.doc(docId).set(updatedData).then(() => {
        console.log("Comment saved successfully!");
        // Refresh page to reflect changes
        // location.reload();
      }).catch((error) => {
        console.error("Error updating document with comment: ", error);
      });
    } else {
      console.error("Document does not exist.");
    }
  }).catch((error) => {
    console.error("Error getting document:", error);
  });
}



// Function to save comment to Firestore document
function saveComment(docId, comment) {
  // Check if the comment is defined and not empty
  if (!comment || comment.trim() === '') {
    console.error("Invalid comment.");
    return;
  }

  // Check if the document exists
  journalRef.doc(docId).get().then((doc) => {
    if (doc.exists) {
      // Get the existing data from the document
      const data = doc.data();
      let updatedData;

      // Check if the comment field exists in the document
      if (data.hasOwnProperty("comment")) {
        // Update the existing comment field
        updatedData = { comment: comment.trim() };
      } else {
        // Create a new comment field with the provided comment
        updatedData = { comment: comment.trim() };
      }

      // Update or set the comment field in the document
      journalRef.doc(docId).set(updatedData, { merge: true }).then(() => {
        console.log("Comment saved successfully!");
        // Refresh page to reflect changes
        location.reload();
      }).catch((error) => {
        console.error("Error updating document with comment: ", error);
      });
    } else {
      console.error("Document does not exist.");
    }
  }).catch((error) => {
    console.error("Error getting document:", error);
  });
}

// Function to delete a journal entry
function deleteJournalEntry(docId) {
  // Prompt the user for confirmation
  const confirmation = confirm("Are you sure you want to delete this entry?");

  // If the user confirms the deletion
  if (confirmation) {
    // Get reference to the delete button
    const deleteButton = document.getElementById(docId + "-delete");

    // Disable the delete button to prevent multiple clicks
    deleteButton.disabled = true;

    // Change the text on the delete button to indicate deletion progress
    deleteButton.textContent = "Deleting...";

    // Get reference to the document and delete it
    journalRef.doc(docId)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
        alert("Document successfully deleted!");
        location.reload();
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
        alert("Error removing document.");
      })
      .finally(() => {
        // Re-enable the delete button after deletion attempt
        deleteButton.disabled = false;
        // Reset the text on the delete button
        deleteButton.textContent = "Delete";
      });
  }
}

// Function to handle click event on "Consult Crop" button
document.getElementById('consultCropBtn').addEventListener('click', function() {
  // Construct the URL for index.html with the collection ID as a query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const collectionId = urlParams.get('collection');
  const indexPageUrl = `chatbot.html?collection=${collectionId}`;
  
  // Redirect to index.html with the collection ID preserved
  window.location.href = indexPageUrl;
});

// Fetch and display all documents from the collection referenced by journalRef sorted by date in descending order
journalRef.orderBy("date", "desc").get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    renderJournalEntry(doc); // Render each document entry
  });
}).catch((error) => {
  console.error("Error getting journal entries: ", error);
});