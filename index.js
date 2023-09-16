let kommuner = [];

const URLkommuner = "http://localhost:8080/kommuner"
const URLkommune  = "http://localhost:8080/kommune"
const URLregioner  = "http://localhost:8080/regioner"

const kommuneTableBody = document.getElementById("kommune-table-body")
// bootstrap modal
let kommuneModal
const modalTitle = document.getElementById("modal-title")
const buttonSave = document.getElementById("btn-save")
const buttonAdd = document.getElementById("btn-add-kommune")
// form
const kommuneForm = document.getElementById("kommuneForm")
const inputKode = document.getElementById("input-kode")
const inputNavn = document.getElementById("input-navn")
const inputRegionSelect = document.getElementById("input-region")

async function fetchAndParse(url, options) {
  const result = await fetch(url, options)
  if ( !result.ok ) throw new Error( await result.text() )

  return await result.json()
}

//Handlers
function setUpHandlers() {
  kommuneTableBody.addEventListener( 'click', editOrDeleteTableItem )
  buttonSave.addEventListener( 'click', event => validateForm(event, true))
  buttonAdd.addEventListener( 'click', () => showModal() )
}

function validateInput() {
  const inputRegionInput = inputRegionSelect.selectedOptions
  if (!inputKode.value) return false
  if (!inputNavn.value) return false
  if (!inputRegionInput?.[0].value) return false
  return true
}

function validateForm(event, shouldSubmit = true) {
  const inputKodeErrorMessage = document.querySelector( '#input-kode ~ .invalid-feedback' )
  inputKodeErrorMessage.innerText = 'Please provide valid kode.'
  inputKode.setCustomValidity('')
  if (!inputKode.disabled && getKommuneIndexByKode(inputKode.value) > -1) {
    inputKodeErrorMessage.innerText = 'Duplicated kode.'
    inputKode.setCustomValidity('duplicated')
    event.stopPropagation()
    event.preventDefault()
  } else if (!validateInput()) {
    event.stopPropagation()
    event.preventDefault()
  } else if (!shouldSubmit) {
  } else {
    kommuneModal.hide()
    addOrEditKommune()
  }
  kommuneForm.classList.add('was-validated')
}

//Table
function renderRows() {
  //make rows from data
  const rows = kommuner.map(kommune => `
        <tr>
            <td>${kommune.kode}</td>
            <td>${kommune.navn}</td>
            <td>${kommune.region.navn}</td>
            <td><a data-id-delete=${kommune.kode} href="#">Delete</a></td>
            <td><a data-id-edit="${kommune.kode}" href="#">Edit</a></td>
        </tr>
        `)
  kommuneTableBody.innerHTML = rows.join("\n")
}

//Modal
function showModal(kommune) {
  kommuneModal = new bootstrap.Modal(document.getElementById('kommune-modal'))
  const isEdit = Boolean( kommune?.kode )
  const inputRegionOption = inputRegionSelect.querySelector("option")

  if ( isEdit ) {
    modalTitle.innerText = "Edit Kommune"
    inputKode.disabled = true
    inputKode.value = kommune?.kode || ''
    inputNavn.value = kommune?.navn || ''
    inputRegionSelect.disabled = true
    inputRegionOption.value = kommune?.region?.kode
    inputRegionOption.innerText = kommune?.region?.navn
    inputRegionOption.selected = true
  } else {
    modalTitle.innerText = "Add Kommune"
    inputKode.disabled = false
    inputKode.value = kommune?.kode || ''
    inputNavn.value = ''
    inputRegionSelect.disabled = false
    inputRegionOption.value = ''
    inputRegionOption.innerText = 'Choose...'
    inputRegionOption.selected = true
  }

  kommuneModal.show()
}

function getKommuneIndexByKode( kode ) {
  for ( let i = 0; i < kommuner.length; ++i ) {
    if ( kommuner[i].kode === kode ) {
      return i
    }
  }
  return -1
}

// Kommune
async function fetchKommuner() {
  kommuner = await fetchAndParse(URLkommuner)
  renderRows()
}

async function addOrEditKommune() {
  const kode = inputKode.value
  const regionOption = inputRegionSelect.selectedOptions[0]
  const newKommune = {
    kode: kode,
    navn: inputNavn.value,
    region: {
      kode: regionOption.value,
      navn: regionOption.innerText
    }
  }
  if (!newKommune.region.kode) return

  const kommuneIndex = getKommuneIndexByKode(kode)
  if (kommuneIndex > -1) {
    // Edit
    await fetchAndParse(
      `${URLkommune}/${kode}`,
      {
        method: "PATCH",
        body: JSON.stringify(newKommune),
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
    kommuner[kommuneIndex] = newKommune
  } else {
    // Add
    await fetchAndParse(
      `${URLkommune}/${kode}`,
      {
        method: "POST",
        body: JSON.stringify(newKommune),
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
    kommuner.push(newKommune)
  }
  renderRows()
}

async function deleteKommune(kode) {
  await fetchAndParse(
    `${URLkommune}/${kode}`,
    {
      method: "DELETE"
    }
  )
  const kommuneIndex = getKommuneIndexByKode(kode)
  if (kommuneIndex > -1) kommuner.splice(kommuneIndex, 1)
  renderRows()
}

// Edit & Delete
async function editOrDeleteTableItem(event) {
  event.preventDefault()
  event.stopPropagation()
  const target = event.target
  const idToDelete = target.getAttribute('data-id-delete')
  const idToEdit = target.getAttribute('data-id-edit')

  if (idToDelete) {
    await deleteKommune(idToDelete)
  } else if (idToEdit) {
    const kommuneIndex = getKommuneIndexByKode(idToEdit)
    if (kommuneIndex > -1) showModal(kommuner[kommuneIndex])
  }
}

async function main() {
  setUpHandlers()
  await fetchAndParse( URLregioner )
  await fetchKommuner()
}

(async () => {
  await main()
})()
