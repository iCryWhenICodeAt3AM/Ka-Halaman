
const listContainer = document.getElementById('journal-collections');

// Function to save new crop
document.getElementById('saveCropBtn').addEventListener('click', function () {
    const cropName = document.getElementById('cropName').value;
    const initialBudget = document.getElementById('initialBudget').value;
    const cropPhoto = document.getElementById('cropPhoto').files[0];

    // Upload photo to Firebase Storage
    const storageRef = storage.ref('crop_photos/' + cropPhoto.name);
    storageRef.put(cropPhoto).then(function (snapshot) {
        console.log('Uploaded a blob or file!');
        // Get the download URL of the uploaded photo
        storageRef.getDownloadURL().then(function (url) {
            // Save data to Firestore
            db.collection("crops").add({
                cropName: cropName,
                initialBudget: initialBudget,
                imageURL: url
            }).then(function (docRef) {
                console.log("Crop saved with ID: ", docRef.id);
                // Reset form inputs
                document.getElementById('cropName').value = '';
                document.getElementById('initialBudget').value = '';
                document.getElementById('cropPhoto').value = '';
                document.getElementById('cropPhotoPreview').style.display = 'none';
                // Close modal
                $('#addCropModal').modal('hide');
                // Refresh crops and carousel
                displayCrops();
            }).catch(function (error) {
                console.error("Error adding crop: ", error);
            });
        }).catch(function (error) {
            console.error("Error getting download URL: ", error);
        });
    });
});

// Function to fetch and display crops
async function displayCrops() {
    const cropsTable = document.getElementById('myCropsTable');

    // Clear existing data
    cropsTable.innerHTML = '';

    // Fetch crops from Firestore
    const querySnapshot = await db.collection("crops").get();

    querySnapshot.forEach(doc => {
        const cropData = doc.data();
        const cropName = cropData.cropName;
        const initialBudget = cropData.initialBudget;
        // Rey Adjustment
        cropId = doc.id;


        // Create new row in table
        const row = cropsTable.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2); // Add a new cell for the delete button

        // Add data to row
        cell1.innerHTML = cropName;
        cell2.innerHTML = initialBudget;

        // Add a delete button to the row
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'X'; // Set the button text to "X"
        deleteButton.classList.add('btn', 'btn-danger', 'delete-crop-button');
        deleteButton.dataset.cropName = cropName; // Store the crop name as a data attribute
        // Rey adjustment
        deleteButton.dataset.cropId = cropId; // Store the crop name as a data attribute
        cell3.appendChild(deleteButton);

        // Add swipe gesture handler to each cell
        [cell1, cell2].forEach(cell => {
            cell.style.cursor = 'pointer'; // Change cursor to pointer
            cell.addEventListener('click', () => {
                // Get the crop name and initial budget from the clicked cell
                const cropName = cell.parentElement.cells[0].textContent;
                const initialBudget = cell.parentElement.cells[1].textContent;
                
                // Set the modal title to the crop name
                document.getElementById('myModalTitle').textContent = cropName;
                // Set the initial budget in the modal
                document.getElementById('modalInitialBudget').textContent = 'Initial Budget: $' + initialBudget;

                // Fetch the image URL of the crop from Firestore based on the crop name
                db.collection("crops").where("cropName", "==", cropName)
                    .get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((cropDoc) => {
                            const imageURL = cropDoc.data().imageURL;
                            // Set the image source in the modal
                            // ----------------------- Rey -----------------------------
                            cropId = cropDoc.id;

                            journalCollectionsDiv.innerHTML = '';
                            
                            // Fetch journal documents for the current crop
                            db.collection("crops")
                            .doc(cropId)
                            .collection("journals")
                            .orderBy("date", "desc") // Sort documents by timestamp in descending order
                            .get()
                            .then((journalQuerySnapshot) => {
                                journalQuerySnapshot.forEach((journalDoc) => {
                                    journalId = journalDoc.id; // Get the journal ID
                                    console.log(journalId);
                                    const journalData = journalDoc.data();
                                    const journalName = journalData.name; // Assuming the name field exists in the journal document data
                                    const journalDate = journalData.date;
                                    // Create a button for each journal document
                                    const div = document.createElement('div');
                                    div.textContent = journalName; // Display the journal name as text
                                    div.className = 'journal-collection-button m-2';
                                    // Add click event listener to navigate to journal.html with cropId and journalId as query parameters
                                    // button.addEventListener('click', () => {
                                    //     window.location.href = `journal.html?cropId=${cropId}&journalId=${journalId}`;
                                    // });
                                    // Create a button HTML string for each journal document
                                    // Assuming journalDate is a JavaScript Date object
                                    // let formattedDate = journalDate.toLocaleDateString();
                                    console.log(journalDate); // Check if there are any errors or unexpected output in the console

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
                                    listContainer.innerHTML += contentDiv;             
                                });
                                // Append the button to the container
                                journalCollectionsDiv.appendChild(listContainer);
                            })
                            .catch((error) => {
                                console.error("Error getting journal documents: ", error);
                            });
                            // ----------------------- Rey -----------------------------
                            document.getElementById('modalCropImage').src = imageURL;

                            // Display todos for the current crop
                            displayTodosForCrop(cropName);

                            // Open the modal
                            $('#myModal').modal('show');
                        });
                    })
                    .catch((error) => {
                        console.log("Error getting documents: ", error);
                    });
            });
        });
    });

    // Add event listener to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-crop-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const confirmation = confirm('Are you sure you want to delete this crop?');
            if (confirmation) {
                // Get the crop name from the button's dataset
                const cropName = button.dataset.cropName;
                // Delete crop from Firestore
                db.collection("crops").where("cropName", "==", cropName)
                    .get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            doc.ref.delete().then(() => {
                                console.log("Crop successfully deleted!");
                                window.alert('Crop successfully deleted!');
                                // Refresh crops and carousel
                                displayCrops();
                            }).catch((error) => {
                                console.error("Error deleting crop: ", error);
                            });
                        });
                    })
                    .catch((error) => {
                        console.log("Error getting documents: ", error);
                    });
            }
        });
    });
}

// Function to navigate to journal.html with cropId and journalId as query parameters
function navigateToJournal(cropId, journalId) {
    window.location.href = `journal.html?cropId=${cropId}&journalId=${journalId}`;
}

// Function to fetch and display todos associated with a crop
function displayTodosForCrop(cropName) {
    const todoList = document.getElementById('todoList'); 

    // Clear existing todos
    todoList.innerHTML = '';

    // Fetch todos associated with the specific crop name from Firestore
    db.collection("todos").where("cropName", "==", cropName)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const todoData = doc.data();
                // Calculate due date relative to today's date
                const dueDate = new Date(todoData.dueDate);
                const today = new Date();
                const diffTime = dueDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let dueDateText;
                if (diffDays === 0) {
                    dueDateText = 'due today';
                } else if (diffDays === 1) {
                    dueDateText = 'due tomorrow';
                } else {
                    dueDateText = 'due in ' + diffDays + ' days';
                }

                // Append each todo to the todoList table
                todoList.innerHTML += `
                    <tr>
                        <td><input type="checkbox" class="form-check-input todo-checkbox"></td>
                        <td>${todoData.taskType}</td>
                        <td>${dueDateText}</td>
                        <td>${todoData.cost}</td>
                        <td><button type="button" class="btn btn-sm btn-danger delete-todo-button" data-todo-id="${doc.id}">X</button></td>
                    </tr>
                `;
            });

            // Add event listener to delete todo buttons
            const deleteTodoButtons = document.querySelectorAll('.delete-todo-button');
            deleteTodoButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const confirmation = confirm('Are you sure you want to delete this todo?');
                    if (confirmation) {
                        const todoId = button.dataset.todoId;
                        // Delete todo from Firestore
                        db.collection("todos").doc(todoId).delete()
                            .then(() => {
                                console.log("Todo successfully deleted!");
                                // Refresh todos for the current crop
                                displayTodosForCrop(cropName);
                            })
                            .catch((error) => {
                                console.error("Error deleting todo: ", error);
                            });
                    }
                });
            });

            // Add event listener to todo checkboxes
            const todoCheckboxes = document.querySelectorAll('.todo-checkbox');
            todoCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function () {
                    const todoRow = checkbox.parentElement.parentElement;
                    if (checkbox.checked) {
                        todoRow.style.textDecoration = 'line-through';
                    } else {
                        todoRow.style.textDecoration = 'none';
                    }
                });
            });
        })
        .catch((error) => {
            console.log("Error getting todos: ", error);
        });
}

        // Event listener for the "Save" button in the add todo form
        document.body.addEventListener('submit', function (event) {
            if (event.target.id === 'addTodoForm') {
                event.preventDefault(); // Prevent form submission
                addTodo(); // Call the addTodo function to save the todo
            }
        });

        // Function to toggle visibility of image and initial budget sections
document.getElementById('toggleAddTodoFormBtn').addEventListener('click', function () {
    const imageAndBudgetSection = document.getElementById('imageAndBudgetSection');
    const addTodoFormSection = document.getElementById('addTodoFormSection');

    if (imageAndBudgetSection.style.display === 'none') {
        imageAndBudgetSection.style.display = 'block';
        addTodoFormSection.style.display = 'none';
    } else {
        imageAndBudgetSection.style.display = 'none';
        addTodoFormSection.style.display = 'block';
    }
});

// Event listener for the "Save Todo" button
document.getElementById('saveTodoBtn').addEventListener('click', function () {
    // Get values from form fields
    const taskType = document.getElementById('taskType').value.trim();
    const dueDate = document.getElementById('dueDate').value.trim();
    const cost = document.getElementById('cost').value.trim();
    const cropName = document.getElementById('myModalTitle').textContent; // Get crop name from modal title

    // Check if any field is empty
    if (taskType === '' || dueDate === '' || cost === '') {
        alert("Please fill in all fields.");
        return; // Exit function if any field is empty
    }

    // Save todo to Firebase
    db.collection("todos").add({
        cropName: cropName,
        taskType: taskType,
        dueDate: dueDate,
        cost: cost
    }).then(function (docRef) {
        console.log("Todo saved with ID: ", docRef.id);
        // Reset form inputs
        document.getElementById('taskType').value = '';
        document.getElementById('dueDate').value = '';
        document.getElementById('cost').value = '';
        // Display todos for the current crop
        displayTodosForCrop(cropName);

        // Show the add todo button again
        document.getElementById('toggleAddTodoFormBtn').style.display = 'block';
        // Hide the add todo form
        document.getElementById('addTodoFormSection').style.display = 'none';
    }).catch(function (error) {
        console.error("Error adding todo: ", error);
    });
});



// Call the function to display crops when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    displayCrops();
});

// Add event listener to delete buttons when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const deleteButtons = document.querySelectorAll('.delete-crop-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const confirmation = confirm('Are you sure you want to delete this crop?');
            if (confirmation) {
                // Get the document ID from the button's data attribute
                const docId = button.dataset.docId;
                
                // Delete crop document from Firestore
                db.collection("crops").doc(docId).delete()
                    .then(() => {
                        console.log("Crop successfully deleted!");
                        window.alert('Crop successfully deleted!');
                        // Refresh crops and carousel
                        displayCrops();
                    })
                    .catch((error) => {
                        console.error("Error deleting crop: ", error);
                    });
            }
        });
    });
});
