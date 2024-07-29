let messages = document.getElementById("messages-container");
let text = document.getElementById("input-msg");
let sendButton = document.getElementById("send-msg-btn");
let userButton = document.getElementById("send-username-btn");
let userName = document.getElementById("input-username");
let nameOfUser, date, sendTo, currentNode;

//send username
userButton.addEventListener("click", e => {
    document.getElementById("user-page").style.display = "none";
    document.getElementById("messages").style.display = "flex";
    document.getElementById("send-msg").style.display = "grid";
    document.getElementById("user-cont").style.display = "grid";
    document.querySelector(".main-container").style.display = "grid";
    nameOfUser = userName.value;
    receiveOldUsers();
    receiveOldMessages();
    sendUserName(nameOfUser);
    receiveCount();
    counterSubscription = client.subscribe("/topic/counter/"+nameOfUser, counter => {
        handleCount(counter.body);
    });
});

//handle private message count
let handleCount = (count) => {
    if(document.getElementById("chat-with").innerText===count){
        return null;
    }else{
        document.querySelectorAll(".user").forEach( e => {
            if(e.innerText===count){
                let newCounter
                if(!e.nextElementSibling){
                    newCounter = document.createElement("div");
                    newCounter.setAttribute("class", "new-message-counter");
                    e.parentElement.appendChild(newCounter);
                }
                if(e.nextElementSibling.innerText===""){
                    e.nextElementSibling.innerText = 1;
                    handleUserOrder(e.parentElement);
                }else{
                    e.nextElementSibling.innerText = Number(e.nextElementSibling.innerText)+1;
                    handleUserOrder(e.parentElement);
                }
            }
        });
    }
}

//handleUserOrder
function handleUserOrder(parent){
    let contElements = document.getElementsByClassName("user-container");
    parent.remove();
    document.getElementById("users").insertBefore(parent, contElements[0]);
}

//Enable or disable user button
userName.addEventListener("input", e => {
    if(userName.value==""){
        userButton.disabled = true;
        userButton.style.cursor = "not-allowed";
        userButton.style.background = "grey";
    }else{
        userButton.disabled = false;
        userButton.style.cursor = "pointer";
        userButton.style.background = "black";
    }
});

//when click on send button
sendButton.addEventListener("click", e => {
    date = new Date();
    console.log(date);
    if(sendButton.className==="public-send"){
        sendMessage(text.value, nameOfUser, date, "public");
    }else{
        sendMessage(text.value, nameOfUser, date, "private");
    }
    text.value = "";
    sendButton.disabled = true;
});

//Enable or disable message button
text.addEventListener("input", e => {
    if(text.value==""){
        sendButton.disabled = true;
    }else{
        sendButton.disabled = false;
    }
});

//public or private chats
document.body.addEventListener("click", e => {
    if(e.target.className==="user-container"||e.target.className==="user"){
        let targetNode = e.target;
        if(e.target.className==="user"){
            let parent = e.target.parentElement;
            targetNode = parent;
            console.log(parent);
        }
        if(currentNode!==targetNode&&currentNode){
            currentNode.style.pointerEvents = "auto";
            currentNode.style.cursor = "pointer";
            //let newCounter = document.createElement("div");
            //newCounter.setAttribute("class", "new-message-counter");
            //currentNode.appendChild(newCounter);
            privateSubscription.unsubscribe();
        }
        removeChats();
        document.getElementById("public-chat-btn").removeAttribute("class", "active-public");
        document.getElementById("public-chat-btn").setAttribute("class", "inactive-public");
        document.getElementById("public-chat-btn").disabled = false;
        document.getElementById("public-chat-btn").style.cursor = "pointer";
        console.log(targetNode.firstElementChild);
        if(targetNode.children[1]){
            targetNode.removeChild(targetNode.lastElementChild);
        }
        document.getElementById("chat-with").innerText = targetNode.firstElementChild.innerText;
        //targetNode.style.cursor = "not-allowed";
        sendTo=targetNode.firstElementChild.innerText;
        currentNode = targetNode;
        //currentNode.style.pointerEvents = "none";
        sendButton.removeAttribute("class", "public-send");
        sendButton.setAttribute("class", "private-send");
        publicSubscription.unsubscribe();
        privateSubscription = client.subscribe("/topic/private/"+nameOfUser+"/"+sendTo, message => {
            console.log(message);
            displayMessage(JSON.parse(message.body));
            if(e.target.innerText===document.getElementById("chat-with").innerText){
                handleUserOrder(targetNode);
            }
        });
        getChats(targetNode.innerText);

    }else if(e.target.id==="public-chat-btn"){
        removeChats();
        document.getElementById("public-chat-btn").removeAttribute("class", "inactive-public");
        document.getElementById("public-chat-btn").setAttribute("class", "active-public");
        document.getElementById("public-chat-btn").disabled = true;
        document.getElementById("public-chat-btn").style.cursor = "not-allowed";
        document.getElementById("chat-with").innerText = "Public chat";
        sendButton.removeAttribute("class", "private-send");
        sendButton.setAttribute("class", "public-send");
        privateSubscription.unsubscribe();
        console.log(currentNode);
        currentNode.style.pointerEvents = "auto";
        currentNode.style.cursor = "pointer";
        //let newCounter = document.createElement("div");
        //newCounter.setAttribute("class", "new-message-counter");
        //currentNode.appendChild(newCounter);
        publicSubscription = client.subscribe("/topic/public", message => {
            console.log(message);
            displayMessage(JSON.parse(message.body));
        });
        getChats("Public chat");
    }
});

function removeChats(){
    document.querySelectorAll(".message-container").forEach( e => {
        e.remove();
    });
}

//rest get chats
async function getChats(str){
    try {
        console.log(str,nameOfUser);
        let response = await fetch("http://localhost:28852/messages", {
            method: "POST",
            mode: "cors",
            credentials: "same-origin",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sender: str,
                currentUser: nameOfUser
            })
        });
        let data = await response.json();
        displayMessage(data);
    }catch (error){
        console.log("No messages");
    }
}

//websockets
let sock = new SockJS('http://localhost:28852/ws');
let client = Stomp.over(sock);
let publicSubscription, oldSubscription, userSubscription, oldUserSubscription, updateUserSubscription, privateSubscription,
counterSubscription;
client.connect({}, e => {
    console.log("connected"+e);
    publicSubscription = client.subscribe("/topic/public", message => {
        console.log(message);
        displayMessage(JSON.parse(message.body));
    });
    oldSubscription = client.subscribe("/topic/oldPublic", message => {
            displayMessage(JSON.parse(message.body));
    });
    oldUserSubscription = client.subscribe("/topic/addOldUser", user => {
            addUser(user);
        });
    userSubscription = client.subscribe("/topic/addUser", user => {
            addUser(user);
    });
    updateUserSubscription = client.subscribe("/topic/updateCurrentUsers", currentUsers => {
            updateUsers(currentUsers);
    });
})

function sendMessage(msg, name, date, str){
    if(document.getElementById("chat-with").innerText==="Public chat"){
        client.send("/app/chat", {}, JSON.stringify({
                "text": msg,
                "name": name,
                "date": date,
                "type": str,
                "sendTo": "public"
            })
        );
    }else{
        client.send("/app/privateChat", {}, JSON.stringify({
                "text": msg,
                "name": name,
                "date": date,
                "type": str,
                "sendTo": sendTo
            })
        );
        /*document.querySelectorAll(".user").forEach( e => {
            if(e.innerText===document.getElementById("chat-with").innerText){
                handleUserOrder(e.parentElement);
            }
        })*/
    }
}

function sendUserName(){
    client.send("/app/newUser", {}, JSON.stringify({
            "userName": nameOfUser
        })
    );
}

function receiveOldMessages(){
    client.send("/app/oldChat", {});
}

function receiveOldUsers(){
    client.send("/app/oldUser", {});
}

function receiveCount(){
    client.send("/app/counter", {}, JSON.stringify({
            "receiver": ".",
            "sender": "."
        })
    );
}

//on users leaving and joining
function updateUsers(currentUsers){
    let msgObj = JSON.parse(currentUsers.body);
    document.querySelectorAll(".user-container").forEach(e => {
        e.remove();
    });
    for(let i=0; i<msgObj.length; i++){
        let usrStr = msgObj[i]["user"];
        if(usrStr===nameOfUser){
            continue;
        }
        let userContainer = document.createElement("div");
        let addUserName = document.createElement("div");
        //let newCounter = document.createElement("div");
        userContainer.setAttribute("class", "user-container");
        addUserName.setAttribute("class", "user");
        //newCounter.setAttribute("class", "new-message-counter");
        addUserName.innerText = usrStr;
        userContainer.appendChild(addUserName);
        //userContainer.appendChild(newCounter);
        document.getElementById("users").appendChild(userContainer);
    }
}

//add users on login
function addUser(user){
    let msgObj = JSON.parse(user.body);
    for(let i=0; i<msgObj.length; i++){
        if(msgObj[i]["key"]==="empty"){
            oldUserSubscription.unsubscribe();
            break;
        }
        let usrStr = msgObj[i]["user"];
        if(usrStr===nameOfUser){
            continue;
        }
        let userContainer = document.createElement("div");
        let addUserName = document.createElement("div");
        //let newCounter = document.createElement("div");
        userContainer.setAttribute("class", "user-container");
        addUserName.setAttribute("class", "user");
        //newCounter.setAttribute("class", "new-message-counter");
        addUserName.innerText = usrStr;
        userContainer.appendChild(addUserName);
        //userContainer.appendChild(newCounter);
        document.getElementById("users").appendChild(userContainer);
    }
}

function displayMessage(msgObj){
    for(let i=0; i<msgObj.length; i++){
        if(msgObj[i]["key"]==="empty"){
            oldSubscription.unsubscribe();
            break;
        }

        let user = msgObj[i]["name"];
        let msgStr = msgObj[i]["text"];
        let UtcDate = msgObj[i]["date"];
        let localDate = new Date(UtcDate).toString().slice(0, 21);

        let messageCont = document.createElement("div");
        messageCont.setAttribute("class", "message-container");
        let userDate = document.createElement("div");
        userDate.setAttribute("class", "userDate-container");
        let textCont = document.createElement("div");
        textCont.setAttribute("class", "text-container");

        let message = document.createElement("div");
        message.setAttribute("class", "message");
        let sender = document.createElement("div");
        sender.setAttribute("class", "sender");
        let messageDate = document.createElement("div");
        messageDate.setAttribute("class", "date");

        message.innerText = msgStr;
        sender.innerText = user;
        messageDate.innerText = localDate;

        messages.appendChild(messageCont);
        messageCont.appendChild(userDate);
        messageCont.appendChild(textCont);
        userDate.appendChild(sender);
        userDate.appendChild(messageDate);
        textCont.appendChild(message);

        if(user!==nameOfUser){
            messageCont.style.alignSelf = "flex-start";
        }
    }
}