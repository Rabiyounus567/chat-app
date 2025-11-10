import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, remove, update } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey:"AIzaSyAAJGSxKW5Y9q4N6SMRD4f9Obd5KjiipUs",
  authDomain:"chat-app-963d6.firebaseapp.com",
  databaseURL:"https://chat-app-963d6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"chat-app-963d6",
  storageBucket:"chat-app-963d6.appspot.com",
  messagingSenderId:"550916676021",
  appId:"1:550916676021:web:ad299d44f2a8d12368e1fc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// ===== Functions =====
function signup(){
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if(!email || !password) return alert("Enter email & password");
  createUserWithEmailAndPassword(auth,email,password)
    .then(()=>window.location.href="popup.html")
    .catch(e=>alert(e.message));
}

function login(){
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if(!email || !password) return alert("Enter email & password");
  signInWithEmailAndPassword(auth,email,password)
    .then(()=>window.location.href="popup.html")
    .catch(e=>alert(e.message));
}

function googleSignIn(){
  signInWithPopup(auth,provider)
    .then(()=>window.location.href="popup.html")
    .catch(e=>alert(e.message));
}

function enterChat(){
  const uname = document.getElementById("popupUsername").value.trim();
  if(!uname) return alert("Enter username");
  localStorage.setItem("username", uname.replace(/[.#$[\]]/g,"_"));
  window.location.href="chatroom.html";
}

// ===== Expose to window for onclick =====
window.signup = signup;
window.login = login;
window.googleSignIn = googleSignIn;
window.enterChat = enterChat;

// ===== Chatroom logic =====
document.addEventListener("DOMContentLoaded", ()=>{
  const chatBox = document.getElementById("chat-box");
  const messageInput = document.getElementById("message");
  const sendBtn = document.getElementById("sendBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const emojiBtn = document.getElementById("emojiBtn");
  const emojiPanel = document.getElementById("emojiPanel");

  if(!chatBox) return;

  const username = localStorage.getItem("username");

  // Load messages
  onChildAdded(ref(db,"messages"), snapshot=>{
    const data = snapshot.val();
    const messageId = snapshot.key;

    const container = document.createElement("div");
    container.classList.add("message-container");
    container.classList.add(data.username===username?"sent":"received");

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message-text");
    msgDiv.textContent = `${data.username}: ${data.message}`;
    container.appendChild(msgDiv);

    if(data.username===username){
      const editBtn = document.createElement("span");
      editBtn.textContent = "✏️";
      editBtn.addEventListener("click", ()=>{
        const newText = prompt("Edit your message:", data.message);
        if(newText && newText.trim()!==""){
          update(ref(db,`messages/${messageId}`),{message:newText});
          msgDiv.textContent = `${data.username}: ${newText}`;
        }
      });

      const delBtn = document.createElement("span");
      delBtn.textContent="🗑️";
      delBtn.addEventListener("click", ()=>{
        if(confirm("Delete this message?")) remove(ref(db,`messages/${messageId}`)).then(()=>container.remove());
      });

      container.appendChild(editBtn);
      container.appendChild(delBtn);
    }

    chatBox.appendChild(container);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // Send message
  if(sendBtn){
    sendBtn.addEventListener("click", ()=>{
      const message = messageInput.value.trim();
      if(!message) return;
      push(ref(db,"messages"),{username,message}).then(()=>messageInput.value="");
    });
  }

  // Emoji panel
  if(emojiBtn && emojiPanel){
    const emojis = ["😀","😂","😍","😊","😎","😢","🥰","😜","👍","🎉","🔥","💜","💖","✨","🙌"];
    emojis.forEach(e=>{
      const span = document.createElement("span");
      span.textContent = e;
      span.style.cursor="pointer";
      span.style.fontSize="20px";
      span.addEventListener("click", ()=>messageInput.value+=e);
      emojiPanel.appendChild(span);
    });

    emojiBtn.addEventListener("click", ()=>{
      emojiPanel.style.display = emojiPanel.style.display==="flex"?"none":"flex";
      emojiPanel.style.flexWrap = "wrap";
    });
  }

  // Logout
  if(logoutBtn){
    logoutBtn.addEventListener("click", ()=>{
      signOut(auth).then(()=>{
        localStorage.removeItem("username");
        window.location.href="index.html";
      });
    });
  }
});
