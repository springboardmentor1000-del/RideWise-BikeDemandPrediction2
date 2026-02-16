<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>RideWise | AI Chatbot</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
:root{
    --bg:#f1f5f9;
    --card:#ffffff;
    --border:#e2e8f0;
    --text:#0f172a;
    --muted:#475569;
    --accent:#2563eb;
}
*{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',sans-serif;}
body{
    min-height:100vh;
    background:linear-gradient(180deg,#f8fafc,#eef2ff);
    display:flex;
    align-items:center;
    justify-content:center;
    color:var(--text);
}
body::before{
    content:"";
    position:fixed;
    inset:0;
    background:
        radial-gradient(circle at 20% 20%, rgba(37,99,235,0.12), transparent 45%),
        radial-gradient(circle at 80% 80%, rgba(96,165,250,0.12), transparent 45%);
    z-index:-1;
}
.main-wrapper{
    width:1250px;
    height:760px;
    display:flex;
    gap:28px;
}
.info-panel{
    flex:1;
    padding:32px;
    border-radius:22px;
    background:rgba(255,255,255,0.75);
    backdrop-filter:blur(14px);
    border:1px solid var(--border);
    box-shadow:0 25px 60px rgba(0,0,0,0.08);
    overflow-y:auto;
}
.info-panel h2{
    font-size:28px;
    margin-bottom:10px;
    background:linear-gradient(90deg,#0f172a,#2563eb);
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
}
.info-panel p{
    font-size:15px;
    color:var(--muted);
    margin-bottom:16px;
}
.feature-card{
    margin-top:18px;
    padding:16px;
    border-radius:18px;
    background:#f8fafc;
    border:1px solid var(--border);
    box-shadow:0 12px 30px rgba(0,0,0,0.08);
    transition:0.35s;
}
.feature-card:hover{
    transform:translateY(-6px);
    box-shadow:0 18px 38px rgba(37,99,235,0.18);
}
.feature-card h3{
    font-size:16px;
    margin-bottom:8px;
    color:var(--accent);
}
.feature-card canvas{
    width:100%;
    height:140px !important;
}
.caption{
    margin-top:6px;
    font-size:12.5px;
    color:var(--muted);
}
.chat-container{
    flex:1.3;
    padding:32px;
    border-radius:22px;
    background:rgba(255,255,255,0.85);
    backdrop-filter:blur(18px);
    border:1px solid var(--border);
    box-shadow:0 30px 70px rgba(0,0,0,0.1);
    display:flex;
    flex-direction:column;
}
.chat-container h1{
    text-align:center;
    font-size:32px;
    margin-bottom:16px;
    background:linear-gradient(90deg,#0f172a,#2563eb);
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
}
#chat-box{
    flex:1;
    overflow-y:auto;
    padding:22px;
    border-radius:18px;
    background:#f8fafc;
    border:1px solid var(--border);
}
#chat-box p{
    margin:14px 0;
    line-height:1.7;
    animation:fadeUp 0.3s ease;
}
@keyframes fadeUp{
    from{opacity:0;transform:translateY(8px);}
    to{opacity:1;transform:translateY(0);}
}
.user{text-align:right;color:#1d4ed8;font-weight:500;}
.bot{color:#0f172a;}
form{
    display:flex;
    gap:10px;
    margin-top:18px;
}
input{
    flex:1;
    padding:15px;
    border-radius:14px;
    border:1px solid var(--border);
    font-size:15px;
    outline:none;
}
button{
    padding:15px 20px;
    border-radius:14px;
    border:none;
    background:linear-gradient(135deg,#2563eb,#60a5fa);
    color:white;
    font-weight:600;
    cursor:pointer;
    transition:0.3s;
    box-shadow:0 15px 35px rgba(37,99,235,0.35);
}
button:hover{
    transform:translateY(-3px);
    box-shadow:0 20px 45px rgba(37,99,235,0.45);
}
.typing span{
    animation:blink 1.4s infinite both;
}
.typing span:nth-child(2){animation-delay:.2s;}
.typing span:nth-child(3){animation-delay:.4s;}
.speaking-icon{
    display:inline-block;
    width:10px;
    height:10px;
    margin-right:4px;
    border-radius:50%;
    background:#2563eb;
    animation:blink-dot 1s infinite;
}
.speaking-icon:nth-child(2){animation-delay:0.2s;}
.speaking-icon:nth-child(3){animation-delay:0.4s;}
@keyframes blink{
    0%{opacity:0;}
    50%{opacity:1;}
    100%{opacity:0;}
}
@keyframes blink-dot{
    0%,50%,100%{opacity:0;}
    25%,75%{opacity:1;}
}
</style>
</head>
<body>

<div class="main-wrapper">
<div class="info-panel">
    <h2>🚀 RideWise Intelligence</h2>
    <p>AI-powered insights for smarter bike rental decisions.</p>
</div>

<div class="chat-container">
    <h1>🚲 RideWise AI Chatbot</h1>

    <div id="chat-box">
        <p class="bot"><em>Ask me anything about bike demand, weather, or predictions...</em></p>
    </div>

    <form id="chat-form">
        <input type="text" id="user-message" placeholder="Type your message..." required>
        <button type="submit">Send</button>
        <button type="button" id="mic-btn">🎤</button>
    </form>
</div>
</div>

<script>
function formatMessage(text){
    return text
        .replace(/### (.*)/g, "<b>$1</b><br>")
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\n\n/g, "<br><br>")
        .replace(/\n/g, "<br>");
}

const form = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-message");
const micBtn = document.getElementById("mic-btn");

// SEND TEXT MESSAGE
form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const message = input.value.trim();
    if(!message) return;
    appendUserMessage(message);
    input.value = "";
    await sendMessage(message);
});

function appendUserMessage(message){
    chatBox.innerHTML += `<p class="user"><b>You:</b> ${message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// MIC BUTTON: SPEECH-TO-TEXT USING WEB SPEECH API
micBtn.addEventListener("click", ()=>{
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition){
        alert("Your browser does not support speech recognition.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    micBtn.innerText = "🎤 Listening...";

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript; // show in input box
    };

    recognition.onerror = (event) => {
        alert("Speech recognition error: " + event.error);
    };

    recognition.onend = () => {
        micBtn.innerText = "🎤";
        input.focus();
    };
});

// FUNCTION TO SEND TEXT MESSAGE TO AI
async function sendMessage(message){
    const typing = document.createElement("p");
    typing.className="bot typing";
    typing.innerHTML="<b>RideWise AI:</b> "+
        '<span class="speaking-icon"></span>'+
        '<span class="speaking-icon"></span>'+
        '<span class="speaking-icon"></span>';
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;

    try{
        const res = await fetch("/chatbot/api",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({message})
        });
        const data = await res.json();
        typing.innerHTML="<b>RideWise AI:</b><br>"+formatMessage(data.reply);
        chatBox.scrollTop = chatBox.scrollHeight;
    }catch{
        typing.innerHTML="<b>RideWise AI:</b> Unable to connect 😕";
    }
}
</script>
</body>
</html>
