const socket = io("http://localhost:3000")

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
  if(e.target && e.target.matches("li.user_name_list")){
    const idUser = e.target.getAttribute("idUser")
    console.log(idUser)

    socket.emit("start_chat", { idUser }, (data) => {
      console.log(data)
    })
  }
})

onLoad()