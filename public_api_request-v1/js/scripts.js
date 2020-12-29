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
        
        let name = user.name.first + ' ' + user.name.last
        let email = user.email
        let city = user.location.city
        let picture = user.picture.large

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
    
    let userCards = document.getElementsByClassName('card')
    
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

    let name = userData.name.first + ' ' + userData.name.last;
    let email = userData.email;
    let city = userData.location.city;
    let state = userData.location.state;
    let picture = userData.picture.large;
    let cell =  userData.cell.substring(0, 5) + " " + userData.cell.substring(6)
    let adress = userData.location.street.number + ' ' + userData.location.street.name +  ', ' + city + ' ' + state + ', ' + userData.location.postcode;
    let birthday = userData.dob.date.substring(5, 7) + '/' + userData.dob.date.substring(8, 10) + '/' + userData.dob.date.substring(0, 4);

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
            createModalWindow(responseData, user-1)
        })
    } else {
        prevButton.disabled = 'true'
    }

    //Calls the createModal function on the next user if the user has a user after to him
    const nextButton = document.getElementById('modal-next')
    if (user !== numberOfUsers-1) {
        nextButton.addEventListener('click', () => {
            document.body.removeChild(modalContainer)
            createModalWindow(responseData, user+1)
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


//Function to filter users based on the search request
function filterUsers (responseData, filter) {
      
    updatedResponseData = [];

    if ( filter == '' || filter == null ) {
        updatedResponseData = responseData;       
    } else {
        responseData.map( (user) => {
            
            let name = user.name.first + ' ' + user.name.last;

            if ( name.toLowerCase().includes(filter) ) {
                updatedResponseData.push(user)
            }
        })
    }

    galleryDiv.innerHTML = '';
    createHTML( updatedResponseData )
    
}