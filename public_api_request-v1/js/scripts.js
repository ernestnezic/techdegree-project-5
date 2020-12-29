/*
*FSJS Techdegree
*Project 5: Public API Requests
*
*Student: Ernest Nezic
*/

/*************************************************/
//DECLARING GLOBAL VARIABLES
/*************************************************/

//API's URL
const apiUrl = 'https://randomuser.me/api/';

//Specifying number of users we want to display
const numberOfUsers = 12;

let responseData;
let updatedResponseData = [];

/*************************************************/
//GETTING REFERENCES OF DOM OBJECTS
/*************************************************/

const galleryDiv = document.getElementById('gallery');
let modalContainer;
const searchContainer = document.getElementsByClassName('search-container')[0]



/*************************************************/
//FETCHING DATA
/*************************************************/

//Requesting data from the Random User Generator API Website, checking and handeling fetching and network errors 
function fetchUsers( url, userNumber ) {
    return fetch(`${url}?results=${userNumber}&nat=us`)
            .then( checkStatus )
            .then( (response) => response.json())
            .catch( (error) => console.log("Problem with fetching data: ", error))
}


//Checking status of fetched data and handeling the Promise() object
function checkStatus( response ) {
    if ( response.ok ) {
        return Promise.resolve( response )
    } else {
        return Promise.reject( new Error( 'Network problem: ', response.statusText))
    }
}

//Requesting the data from the fetchUsers() and passing it over to createHTML() and setupModal() functions
Promise.all([
    fetchUsers( apiUrl, 12 )
])
    .then( (users) => {
        responseData = users[0].results
        filterUsers( responseData );
    })



/*************************************************/
//CREATING HTML
/*************************************************/

//Adding the search button
searchContainer.insertAdjacentHTML('beforeend', `
<form action="#" method="get">
    <input type="search" id="search-input" class="search-input" placeholder="Search...">
    <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
</form>
`);

updateSearch();


//Creating and showing initial user windows
function createHTML( jsonData ) {

    //Maping through parsed data to create individual user cards
    jsonData.map( (user) => {
        
        const name = user.name.first + ' ' + user.name.last
        const email = user.email
        const city = user.location.city
        const picture = user.picture.large

        let cardHtml = `
        <div class="card">
            <div class="card-img-container">
                <img class="card-img" src=${picture} alt="profile picture">
            </div>
            <div class="card-info-container">
                <h3 id="name" class="card-name cap">${name}</h3>
                <p class="card-text">${email}</p>
                <p class="card-text cap">${city}</p>
            </div>
        </div>
        `

        galleryDiv.insertAdjacentHTML('beforeend', cardHtml);
        cardHtml = ``;


    })

    setupModal(updatedResponseData);
}


//Setting up initial modal window
function setupModal( jsonData ) {
    
    const userCards = document.getElementsByClassName('card')
    
    for (let i = 0; i < userCards.length; i++) {
        
        //Adding Event Listeners to each window so it can be clicked to open its modal
        userCards[i].addEventListener('click', (event) => {
            createModalWindow(jsonData, i)
        })

    }

} 


//Creating the modal window for the requested user
function createModalWindow( jsonData, user ) {

    const userData = jsonData[user];
    modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    const name = userData.name.first + ' ' + userData.name.last;
    const email = userData.email;
    const city = userData.location.city;
    const state = userData.location.state;
    const picture = userData.picture.large;
    const cell =  userData.cell.substring(0, 5) + " " + userData.cell.substring(6)
    const adress = userData.location.street.number + ' ' + userData.location.street.name +  ', ' + city + ' ' + state + ', ' + userData.location.postcode;
    const birthday = userData.dob.date.substring(5, 7) + '/' + userData.dob.date.substring(8, 10) + '/' + userData.dob.date.substring(0, 4);

    const modalWindow = `
        <div class="modal-container">
            <div class="modal">
                <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
                <div class="modal-info-container">
                    <img class="modal-img" src=${picture} alt="profile picture">
                    <h3 id="name" class="modal-name cap">${name}</h3>
                    <p class="modal-text">${email}</p>
                    <p class="modal-text cap">${city}</p>
                    <hr>
                    <p class="modal-text">${cell}
                    </p>
                    <p class="modal-text">${adress}</p>
                    <p class="modal-text">Birthday: ${birthday}</p>
                </div>
            </div>
            <div class="modal-btn-container">
                    <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
                    <button type="button" id="modal-next" class="modal-next btn">Next</button>
            </div>
        </div>
    `
    modalContainer.insertAdjacentHTML('beforeend', modalWindow);
    galleryDiv.parentNode.insertBefore(modalContainer, galleryDiv.nextSibling);

    //Calling the function that creates the close, next and previous buttons
    addModalButtons(user)

    
}

//Function that adds the 'close button', 'previous button' and 'next button' functionallity
function addModalButtons (user) {
    
    //Adding Event Listaner to the Close(X) button so the window can be closed(deleted) once user clicks it
    const closeButton = document.getElementsByTagName('button')[0];
    closeButton.addEventListener('click', (event) => {
        document.body.removeChild(modalContainer)
    })

    //Calls the createModal function on the previous user if the user has a user before to him
    const prevButton = document.getElementById('modal-prev')
    if (user !== 0) { 
        prevButton.addEventListener('click', () => {
            document.body.removeChild(modalContainer)
            createModalWindow(updatedResponseData, user-1)
        })
    } else {
        prevButton.disabled = 'true'
    }

    //Calls the createModal function on the next user if the user has a user after to him
    const nextButton = document.getElementById('modal-next')
    if (user !== updatedResponseData.length - 1) {
        nextButton.addEventListener('click', () => {
            document.body.removeChild(modalContainer)
            createModalWindow(updatedResponseData, user+1)
        })
    } else {
        nextButton.disabled = 'true'
    }

}


//Function that updates the page based on the search requested
function updateSearch () {
    searchContainer.firstElementChild.addEventListener('keyup', (event) => {
        let filterText = document.getElementsByClassName('search-input')[0].value
        filterUsers(responseData, filterText.toLowerCase())
    } )
}


//Function to filter users based on the search request and append them to new, updated array
function filterUsers (responseData, filter) {
      
    updatedResponseData = [];

    //If there are no filters applied, we'll use the default array of users
    if ( filter == '' || filter == null ) {
        updatedResponseData = responseData;       
    } else {
        responseData.map( (user) => {
            
            const name = user.name.first + ' ' + user.name.last;

            //Checking if users mathc the search text requested and appending them to the new updated array if they do
            if ( name.toLowerCase().includes(filter) ) {
                updatedResponseData.push(user)
            }
        })
    }

    //Clearing the gallery div so new data can be displayed
    galleryDiv.innerHTML = '';

    //Creating new display windows based on the updated, filtered user data
    createHTML( updatedResponseData )
    
}