import bot from './assets/bot.svg' ;
import user from './assets/user.svg';

const form = document.querySelector("form"); ///since we are not using react we need to do this in our script 
const chatContainer = document.querySelector("#chat_container");

let loadInterval;


function loader(element) {
  element.textContent = "";

  loadInterval = setInterval( () => {
    element.textContent += "." ;

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index) ;
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimalString = randomNumber.toString(16);

  return `id-${timeStamp}-${hexaDecimalString}`;
}

function chatStripe  (isAi, value, uniqueId) {
  return (
    `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // users chatstripe 
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  // bot's chatstripe 
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from the server -> bot's response
  
  const response = await fetch("https://aichatapp.onrender.com/", {
    method: 'POST' , 
    headers: {
      'content-type': 'application/json'
    }, 
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if(response.ok) {
    const data = await response.json(); // this is giving us the actual response coming from the backend 
    const parsedData = data.bot.trim(); // we need to parse it 

    typeText(messageDiv, parsedData); // passing to the typetext function 
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong" ;

    alert(err);
  }
}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode ===13) {
    handleSubmit(e);
  }
})