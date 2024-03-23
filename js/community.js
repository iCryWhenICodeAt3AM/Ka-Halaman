
const form = document.getElementById("imageForm");
const imageContainer = document.getElementById("imageContainer");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("image").files[0];
  const caption = document.getElementById("caption").value;
  // Create a reference to the community-posts folder in Firestore Storage
  const storageRef = storage.ref().child("community-posts/" + file.name);
  const imageRef = storageRef.child(file.name);

  try {
    await imageRef.put(file);
    const imageUrl = await imageRef.getDownloadURL();

    // Save image URL, caption, username, and time to Firestore database
    await db.collection("posts").add({
      imageUrl: imageUrl,
      caption: caption,
      username: "John Doe", // Hardcoded username
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      upvotes: [],
      downvotes: [],
      comments: [], // Initialize comments array
    });

    alert("Posted successfully!");
    form.reset();
    displayPosts();
  } catch (error) {
    console.error("Posting failed ", error);
    alert("Error posting. Please try again.");
  }
});

// Function to display uploaded posts
async function displayPosts() {
  imageContainer.innerHTML = ""; // Clear previous posts

  const postsSnapshot = await db
    .collection("posts")
    .orderBy("createdAt", "desc")
    .get();
  postsSnapshot.forEach((doc) => {
    const imageUrl = doc.data().imageUrl;
    const caption = doc.data().caption;
    const username = doc.data().username;
    const createdAt = doc.data().createdAt.toDate(); // Convert Firestore timestamp to JavaScript Date object
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "Uploaded Image";

    const captionDiv = document.createElement("div");
    captionDiv.classList.add("caption-container");
    captionDiv.innerHTML = `<div><strong>${username}</strong></div><div>${createdAt.toLocaleString(
      "en-US",
      { timeZone: "UTC" }
    )}</div><div>${caption}</div>`;

    const containerDiv = document.createElement("div");
    containerDiv.appendChild(captionDiv);
    containerDiv.classList.add("image-container-item");
    containerDiv.appendChild(img);

    // Create delete button
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.classList.add("btn", "btn-small", "btn-danger");
    deleteButton.addEventListener("click", async () => {
      // Delete post from Firestore
      await db.collection("posts").doc(doc.id).delete();

      // Delete post from Storage
      const imageRef = storage.refFromURL(imageUrl);
      try {
        await imageRef.delete();
        console.log("Post deleted successfully");
      } catch (error) {
        console.error("Error deleting image: ", error);
      }

      // Refresh posts
      displayPosts();
    });
    // Create a row
    const row = document.createElement("div");
    row.classList.add("row");

    // Create the first column for the upvote button
    const upvoteCol = document.createElement("div");
    upvoteCol.classList.add(
      "col",
      "d-flex",
      "justify-content-center",
      "mr-0",
      "pr-0"
    ); // Automatically takes up 50% width on all screen sizes
    // Create upvote button
    const upvoteButton = document.createElement("button");
    upvoteButton.innerText = "Upvote";
    upvoteButton.classList.add("btn", "btn-small", "btn-outline-success");
    upvoteButton.style.width = "100%"; // Set button width to 100% of the parent column
    upvoteButton.addEventListener("click", async () => {
      const userId = "user123"; // Replace with actual user ID
      const upvotes = doc.data().upvotes;
      if (!upvotes.includes(userId)) {
        // Add upvote if user hasn't already upvoted
        upvotes.push(userId);
        await db.collection("posts").doc(doc.id).update({ upvotes });
        displayPosts();
      } else {
        alert("You have already upvoted this post.");
      }
    });

    // Append upvote button to the first column
    upvoteCol.appendChild(upvoteButton);

    // Create the second column for the downvote button
    const downvoteCol = document.createElement("div");
    downvoteCol.classList.add(
      "col",
      "d-flex",
      "justify-content-center",
      "m-0",
      "pl-1"
    ); // Automatically takes up 50% width on all screen sizes
    // Create downvote button
    const downvoteButton = document.createElement("button");
    downvoteButton.innerText = "Downvote";
    downvoteButton.classList.add("btn", "btn-small", "btn-outline-danger");
    downvoteButton.style.width = "100%"; // Set button width to 100% of the parent column
    downvoteButton.addEventListener("click", async () => {
      const userId = "user123"; // Replace with actual user ID
      const downvotes = doc.data().downvotes;
      if (!downvotes.includes(userId)) {
        // Add downvote if user hasn't already downvoted
        downvotes.push(userId);
        await db.collection("posts").doc(doc.id).update({ downvotes });
        displayPosts();
      } else {
        alert("You have already downvoted this post.");
      }
    });

    // Append downvote button to the second column
    downvoteCol.appendChild(downvoteButton);

    // Append columns to the row
    row.appendChild(upvoteCol);
    row.appendChild(downvoteCol);

    // Create comment input
    const commentInput = document.createElement("input");
    commentInput.setAttribute("type", "text");
    commentInput.setAttribute("placeholder", "Add a comment...");
    commentInput.classList.add("form-control", "mt-2");

    // Create comment button
    const commentButton = document.createElement("button");
    commentButton.innerText = "Comment";
    commentButton.classList.add("btn", "btn-small", "btn-primary", "mt-2");
    commentButton.addEventListener("click", async () => {
      const commentText = commentInput.value.trim();
      if (commentText !== "") {
        const comments = doc.data().comments;
        comments.push({
          userId: "user123", // Replace with actual user ID
          text: commentText,
        });
        await db.collection("posts").doc(doc.id).update({ comments });
        displayPosts();
      } else {
        alert("Please enter a comment.");
      }
    });

    // Create comments container
    const commentsContainer = document.createElement("div");
    commentsContainer.classList.add("comments-container", "mt-2");
    // Initialize comments array if it doesn't exist
    const comments = doc.data().comments || [];

    // Iterate over comments if it exists
    comments.forEach((comment) => {
      const commentDiv = document.createElement("div");
      commentDiv.innerHTML = `<strong>${comment.userId}</strong>: ${comment.text}`;
      commentsContainer.appendChild(commentDiv);
    });

    containerDiv.appendChild(deleteButton);

    // Append the row to the document body or any other desired parent element
    containerDiv.appendChild(row);
    containerDiv.appendChild(commentInput);
    containerDiv.appendChild(commentButton);
    containerDiv.appendChild(commentsContainer);

    imageContainer.appendChild(containerDiv);
  });
}

// Initial display of uploaded posts
displayPosts();

document
  .getElementById("imageForm")
  .addEventListener("submit", function (event) {
    // Prevent default form submission
    event.preventDefault();
    // Close the modal
    $("#textareaModal").modal("hide");
    // Additional logic for form submission can be added here
  });