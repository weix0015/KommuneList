let kommuner = [];

const URLkommuner = "http://localhost:8080/getkommuner";
//const URLkommune  = `http://localhost:8080/kommune/${region}`;
const URLRegioner = "http://localhost:8080/getregioner";

//Handlers
function setUpHandlers() {
  document.getElementById("kommune-table-body").onclick = handleTableClick
  document.getElementById("btn-save").onclick = saveKommune
  //document.getElementById("btn-add-kommune").onclick = makeNewKommune
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
//Kommuner
fetchRegioner()
fetchKommuner()
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
//Edit & Delete
function handleTableClick(evt) {
  evt.preventDefault()
  evt.stopPropagation()
  const target = evt.target;

  if (target.dataset.idDelete) {
    const idToDelete = Number(target.dataset.idDelete)

    const options = makeOptions("DELETE")
    fetch(`${URLkommuner}/${idToDelete}`, options)
        .then(handleHttpErrors)
        .catch(err =>{
          if (err.apiError){
            console.error("Full API error: ", err.apiError)

          }else{
            console.error(err.message)
          }
        })
    kommuner = kommuner.filter(s => s.id !== idToDelete)

    makeRows()
  }

  if (target.dataset.idEdit){
    const idToEdit = Number(target.dataset.idEdit)
    const kommuner = kommuner.find(s => s.id === idToEdit)
    showModal(kommuner)
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
//Modal

function showModal(kommune) {
  const myModal = new bootstrap.Modal(document.getElementById('kommune-modal'))
  document.getElementById("modal-title").innerText = kommuner.id ? "Edit Kommuner" : "Add Kommuner"
  document.getElementById("kommuneKode").innerText = kommuner.id
  document.getElementById("kommune-navn").value = kommuner.name

  myModal.show()
}
//Kommune
async function saveKommune() {
  let kommuner = {}
  kommuner.kode = Number(document.getElementById("input-kode").innerText)
  kommuner.navn = document.getElementById("input-navn").value
  kommuner.region = document.getElementById("input-region").value

  if (kommuner.kode){
    const options = makeOptions("PUT",kommuner)
    try {
      kommuner = await fetch(`${URLkommuner}/${kommuner.kode}`,options)
          .then(handleHttpErrors)
    }catch (err){
      if (err.apiError){
        console.error("Full API error: ", err.apiError)
      }else {
        console.error(err.message)
      }
    }
    kommuner = kommuner.map(s => (k.kode === kommuner.kode) ? kommuner : s)
  } else {
    const options = makeOptions("POST",kommuner)
    try {
      kommuner = await fetch(URLkommuner,options)
          .then(handleHttpErrors)

    } catch (err){
      if (err.apiError){
        console.log("Full API error: ", err.apiError)
      }else {
        console.log(err.message)
      }
    }
    kommuner.push(kommuner)
  }

  makeRows()
}