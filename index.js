const URLkommuner = "http://localhost:8080/getkommuner";
//const URLkommune  = `http://localhost:8080/kommune/${region}`;
const URLRegioner = "http://localhost:8080/getregioner";

//Handlers
function setUpHandlers() {
  document.getElementById("kommune-table-body").onclick = handleTableClick
  document.getElementById("btn-save").onclick = saveKommune
  document.getElementById("btn-add-kommune").onclick = makeNewKommune
}
setUpHandlers()

//Regioner
async function fetchRegioner() {
  try {
    regioner = await fetch(URLRegioner)
      .then(handleHttpErrors)
    console.log(regioner)
  } catch (err) {
    if (err.apiError) {
      console.error("Full API error: ", err.apiError)
    }else {
      console.error(err.message)
    }
  }

  makeRows()
}
//Table
function makeRows() {
  //make rows from data
  const rows = kommuner.map(k => `
        <tr>
            <td>${k.kode}</td>
            <td>${k.navn}</td>
            <td>${k.region.navn}</td>
            <td><a data-id-delete=${k.id} href="#">Delete</a></td>
            <!-- <td><a data-data-edit='${JSON.stringify(k)}' href="#">Edit</a></td> -->
            <td><a data-id-edit='${k.id}' href="#">Edit</a></td>
        </tr>
        `)
  document.getElementById("kommune-table-body").innerHTML = rows.join("")
}

fetchRegioner()
fetchKommuner()

//Kommuner
async function fetchKommuner() {

  try {
    kommuner = await fetch(URLkommuner)
      .then(handleHttpErrors)
    console.log(kommuner)
  } catch (err) {
    if (err.apiError) {
      console.error("Full API error: ", err.apiError)
    }else {
      console.error(err.message)
    }
  }

  makeRows()
}

function handleTableClick(evt) {
  evt.preventDefault()
  evt.stopPropagation()
  const target = evt.target;

  if (target.dataset.idDelete) {

    const idToDelete = Number(target.dataset.idDelete)


    const options = makeOptions("DELETE")
    fetch(`${URLkommuner}/${idToDelete}`, options)
      .then(handleHttpErrors)
      .catch( err => {
        if (err.apiError) {
          console.error("Full API error: ", err.apiError)
        } else {
          console.error(err.message)
        }
      })


    kommuner = kommuner.filter(s => s.id !== idToDelete)

    makeRows()
  }


  if (target.dataset.idEdit){
    const idToEdit = Number(target.dataset.idEdit)
    const kommune = kommuner.find(s => s.id === idToEdit)
    showModal(kommune)
  }
}

//Error

async function handleHttpErrors(res) {
  if (!res.ok) {
    const errorResponse = await res.json();
    const error = new Error(errorResponse.message)
    error.apiError = errorResponse
    throw error
  }
  return res.json()
}

function showModal(kommune) {
  const myModal = new bootstrap.Modal(document.getElementById('kommune-modal'))
  document.getElementById("modal-title").innerText = kommune.kode ? "Edit Kommune" : "Add Kommune"
  document.getElementById("kommune-kode").innerText = kommune.kode
  document.getElementById("input-name").value = kommune.navn
  myModal.show()
}

async function saveKommune() {
  let kommuner = {}
  kommuner.kode = Number(document.getElementById("input-kode").innerText)
  kommuner.navn = document.getElementById("input-navn").value
  kommuner.region = document.getElementById("input-region").value

  if (kommuner.id) {
    const options = makeOptions("PUT", kommuner)
    try {
      kommuner = await fetch(`${URLkommuner}/${kommuner.id}`, options)
        .then(handleHttpErrors)
    } catch (err) {
      if (err.apiError){
        console.error("Full API error: ", err.apiError)
      } else {
        console.error(err.message)
      }

    }

    kommuner = kommuner.map(k => (k.kode === kommuner.kode) ? kommuner : k)
  } else {
    const options = makeOptions("POST", kommuner)
    try {
      kommuner = await fetch(URLkommuner, options)
        .then(handleHttpErrors)
    } catch (err) {
      if (err.apiError){
        console.error("Full API error: ", err.apiError)
      }   else {
        console.error(err.message)
      }

    }
    kommuner.push(kommuner)
  }

  makeRows()
}