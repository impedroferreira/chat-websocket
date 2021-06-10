const socket = io("http://localhost:3000")
var idChatRoom = ""

function onLoad() {
  const urlParams = new URLSearchParams(window.location.search)
  const name = urlParams.get("name")
  const email = urlParams.get("email")
  const avatar = urlParams.get("avatar")

  document.querySelector(".user_logged").innerHTML += `
      <img
        class="avatar_user_logged"
        src=${avatar}
      />
      <strong id="user_logged">${name}</strong>
`

  socket.emit("start", {
    name,
    email,
    avatar
  })

  socket.on("new_users", (user) => {
    const existInDiv = document.getElementById(`user_${user._id}`)

    if(!existInDiv) {
      addUser(user)
    }
  })

  socket.emit("get_users", (users) => {
    console.log("getUsers", users)
    
    users.map(user => {
      if(user.email !== email) {
        addUser(user)
      }
    })
  })

  socket.on("message", (data) => {
    if(data.message.roomId === idChatRoom) {
      addMessage(data)
    }
  })

  socket.on("notification", data => {
    if(data.roomId !== idChatRoom) {
      const user = document.getElementById(`user_${data.from._id}`)

      user.insertAdjacentHTML("afterbegin", `
        <div class="notification"></div>
      `)
    }
  })
}

function addMessage(data) {
  const divMessageUser = document.getElementById("message_user")

  divMessageUser.innerHTML += `
  <span class="user_name user_name_date">
  <img
    class="img_user"
    src=${data.user.avatar}
  />
  <strong>${data.user.name} &nbsp;</strong>
  <span> ${dayjs(data.message.created_at).format("DD/MM/YYYY HH:mm")}</span></span
  >
  <div class="messages">
    <span class="chat_message">${data.message.text}</span>
  </div>
  `
}

function addUser(user) {
  const userList = document.getElementById("users_list")

  userList.innerHTML += `
    <li
    class="user_name_list"
    id="user_${user._id}"
    idUser="${user._id}"
    >
      <img
        class="nav_avatar"
        src=${user.avatar}
      />
    ${user.name}
  </li>
  `
}

document.getElementById("users_list").addEventListener("click", (e) => {
  document.getElementById("message_user").innerHTML = ""
  document.querySelectorAll("li.user_name_list").forEach(item => item.classList.remove("user_in_focus"))
  const inputMessage = document.getElementById("user_message")
  inputMessage.classList.remove("hidden")

  if(e.target && e.target.matches("li.user_name_list")){
    const idUser = e.target.getAttribute("idUser")


    e.target.classList.add("user_in_focus")

    const notification = document.querySelector(`#user_${idUser} .notification`)
    if(notification) {
      notification.remove()
    }

    socket.emit("start_chat", { idUser }, (response) => {
      idChatRoom = response.room.idChatRoom;

      response.messages.forEach(message => {
        const data = {
          message,
          user: message.to
        }

        addMessage(data)
      })
    })
  }
})

document.getElementById("user_message").addEventListener("keypress", (e) => {
  if(e.key === "Enter") {
    const message = e.target.value;
    e.target.value = ""

    const data = {
      message,
      idChatRoom
    }

    socket.emit("message", data)
  }
})

onLoad()