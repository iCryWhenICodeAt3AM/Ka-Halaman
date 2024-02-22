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
  
  // Determine the button text and click action based on the 'from' value
  let buttonText;
  let clickAction;
  if (data.from === 'user') {
      buttonText = 'Edit';
      clickAction = `showEditForm('${doc.id}', '${data.data}')`;
  } else {
      buttonText = 'Comment';
      clickAction = `toggleComment('${doc.id}', '${data.comment ? data.comment : ''}')`;
  }
    
  // Define regular expressions to match bold and list items
  const boldRegex = /\*\*(.*?)\*\*/g;
  const listRegex = /\* (.*?)\n/g;

  // Replace bold text
  let formattedData = data.data.replace(boldRegex, '<br><strong>$1</strong>');

  // Replace list items
  formattedData = formattedData.replace(listRegex, '<br>&#8226; $1');

  // Create the inner HTML based on whether the entry is from the user or not
  let innerHTML = `<div class="container">
                        <div class="row">
                          <div class="col-12">
                            <p><strong>Date:</strong> ${dateString}</p>
                          </div>
                          <div class="col-12">
                            <p><strong>Data:</strong> ${formattedData}</p>
                          </div>
                          <div class="col-12">
                            <p><strong>From:</strong> ${data.from}</p>
                          </div>`;
  if (data.from !== 'user') {
      innerHTML += `<div class="col-12">
                        <p><strong>Comment:</strong> ${data.comment ? data.comment : ''}</p>
                    </div>`;
  }
  innerHTML += `<div class="col-12">
                        <div class="row m-3">
                          <div class="col-3 offset-2">
                              <button type="button" id="${doc.id}-action" class="btn btn-success btn-sm" onclick="toggleComment('${doc.id}', '${data.comment ? data.comment : ''}')">${buttonText}</button>
                          </div>
                          <div class="col-3 offset-2">
                            <button type="button" class="btn btn-danger btn-sm" id="${doc.id}-delete" onclick="deleteJournalEntry('${doc.id}')">Delete</button>
                          </div>
                          <div class="col-2"></div>
                        </div>
                        <div id="${doc.id}-comment-section" class="col-12"></div> <!-- Added col-12 for the comment section -->
                    </div>
                  </div>`;

  // Set the inner HTML of entryDiv
  entryDiv.innerHTML = innerHTML;
  journalEntriesDiv.appendChild(entryDiv);
}
// Function to toggle comment section
function toggleComment(docId, comment) {
  const commentSection = document.getElementById(`${docId}-comment-section`);
  const commentButton = document.getElementById(`${docId}-action`);
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

  // Get the current timestamp
  const timestamp = firebase.firestore.Timestamp.now();

  // Save the comment and update the date in Firestore
  journalRef.doc(docId).update({
    comment: comment.trim(),
    date: timestamp // Include the timestamp in the update operation
  }).then(() => {
    console.log("Comment saved successfully!");
    // Reset button text and enable it
    location.reload();
  }).catch((error) => {
    console.error("Error saving comment:", error);
    alert("Error saving comment. Please try again.");
    // Reset button text and enable it
    const commentButton = document.getElementById(`${docId}-action`);
    commentButton.disabled = false;
    commentButton.textContent = 'Comment';
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
  // Check if the query snapshot is empty
  if (querySnapshot.empty) {
    // If the collection is empty, show an alert
    alert("Document is empty!");
  } else {
    // If the collection is not empty, iterate over the documents
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      renderJournalEntry(doc); // Render each document entry
    });
  }
}).catch((error) => {
  console.error("Error getting journal entries: ", error);
});

// Function to show the add note form
function showAddNoteForm() {
  const noteFormContainer = document.getElementById("noteFormContainer");
  noteFormContainer.classList.remove("d-none"); // Remove the d-none class to show the container
}

// Event listener for the "Cancel" button in the add note form
document.getElementById("cancelNoteBtn").addEventListener("click", function() {
  // Prompt the user for confirmation
  const confirmation = confirm("Are you sure you want to cancel adding the note?");

  // If the user confirms the cancellation
  if (confirmation) {
      // Hide the add note form
      hideAddNoteForm();
  }
});
// Event listener for the "Save" button in the add note form
document.getElementById("saveNoteBtn").addEventListener("click", function() {
  const noteTextarea = document.getElementById("noteTextarea");
  const noteText = noteTextarea.value.trim();
  
  if (noteText !== "") {
      // Disable the button to prevent multiple clicks
      this.disabled = true;
      // Change the button text to indicate saving is in progress
      this.textContent = "Saving...";
      
      // Save the note to the database
      journalRef.add({
              data: noteText,
              date: firebase.firestore.Timestamp.now(),
              from: "user" // Assuming the note is added by the user
          })
          .then((docRef) => {
              console.log("Note saved successfully with ID: ", docRef.id);
              alert("Note saved successfully!");
              // Reload the page after successfully saving the note
              location.reload();
          })
          .catch((error) => {
              console.error("Error adding note: ", error);
              alert("Error adding note. Please try again.");
          });
  } else {
      alert("Please enter a note before saving.");
  }
});

// Function to hide the add note form
function hideAddNoteForm() {
  const noteFormContainer = document.getElementById("noteFormContainer");
  const noteTextarea = document.getElementById("noteTextarea");
  
  // Clear the textarea content
  noteTextarea.value = '';

  // Hide the form by adding the d-none class
  noteFormContainer.classList.add("d-none");
}

function showEditForm(docId, existingData) {
  const editFormContainer = document.getElementById(`${docId}-comment-section`);
  editFormContainer.innerHTML = `
    <div class="row">
      <div class="col-12">
        <textarea class="form-control" id="${docId}-editTextarea" rows="1" style="resize: vertical; overflow: hidden;" placeholder="Enter your note" oninput="autoResizeTextarea(this)">${existingData}</textarea>
      </div>
      <div class="col-3 offset-2">
        <button class="btn btn-success m-2" id="${docId}-saveEditBtn" onclick="saveEditedData('${docId}')">Save</button>
      </div>
      <div class="col-3 offset-2">
        <button class="btn btn-danger m-2" onclick="hideEditForm('${docId}')">Cancel</button>
      </div>
    </div>`;toggleComment('Yjzv615lAXUcc37W2sUE', 'Hello there world man super man')
}

// Function to auto-resize textarea
function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight) + 'px';
}

// Function to hide the edit form
function hideEditForm(docId) {
  const editFormContainer = document.getElementById(`${docId}-comment-section`);
  editFormContainer.innerHTML = ''; // Clear the edit form content
}

// Function to save the edited data
function saveEditedData(docId) {
  const editedData = document.getElementById(`${docId}-editTextarea`).value.trim();
  if (editedData !== '') {
    // Disable the button to prevent multiple clicks
    const saveButton = document.getElementById(`${docId}-saveEditBtn`);
    // saveButton.disabled = true;
    // Change the button text to indicate saving is in progress
    saveButton.textContent = "Saving...";
      
    // Get the current timestamp
    const timestamp = firebase.firestore.Timestamp.now();
    
    // Save the edited data to Firestore
    // Replace journalRef with your actual Firestore reference
    journalRef.doc(docId).update({
        data: editedData,
        date: timestamp // Include the timestamp in the update operation
            // Add other fields to update if needed
        })
        .then(() => {
            console.log('Data edited successfully!');
            alert('Data edited successfully!');
            // Reload the page after successfully saving the edited data
            location.reload();
        })
        .catch((error) => {
            console.error('Error editing data: ', error);
            alert('Error editing data. Please try again.');
        });
} else {
    alert('Please enter the edited data before saving.');
}
}
