const app = {
    apiGoogleBooks: "https://www.googleapis.com/books/v1/",
    apiKey: "AIzaSyBIKKDA_pihtlLbSfjFPWY3iK4AfcRbj6g",
    myBooksElement: document.querySelector("#myBooks"),
    contentElement: document.querySelector("#content"),
    hrElement: document.querySelector("hr"),

    // function launched first ( see last line of the code )
    init: function () {
        let divBeforeHrElement = document.createElement("div");
        app.hrElement.before(divBeforeHrElement);
        divBeforeHrElement.setAttribute("id", "globalDiv");
        app.createAndPlaceAddBookButton();
        
    },
    // creates the button to add book and make it appears on page
    createAndPlaceAddBookButton: function () {
        const addBookButtonElement = document.createElement("button");
        addBookButtonElement.setAttribute("id", "addBooks")
        addBookButtonElement.textContent = "Ajouter un livre";
        const globalDiv = document.querySelector("#globalDiv");
        globalDiv.appendChild(addBookButtonElement)
        addBookButtonElement.addEventListener("click", app.addBook);
    },
    // makes the button to disappear and show form
    addBook: function (evt) {
        console.log("bouton Ajouter un livre cliqué");
        let buttonElement = evt.currentTarget;
        buttonElement.style.display = "none";
        app.createForm();
    },

    createForm: function () {
        let divGroupElement = document.createElement("div");
        divGroupElement.classList.add("container");
        divGroupElement.setAttribute("id", "container");

        let formElement = document.createElement("form");
        formElement.classList.add("form");
        formElement.setAttribute("id", "form")

        let subDivTitleElement = document.createElement("div");
        let subDivAuthorElement = document.createElement("div");

        let labelBookTitleElement = document.createElement("label");
        labelBookTitleElement.innerText = "Titre du livre";
        let inputBookTitleElement = document.createElement("input");
        inputBookTitleElement.type = "text";
        inputBookTitleElement.setAttribute("id", "titleInput");

        let labelBookAuthorElement = document.createElement("label");
        labelBookAuthorElement.innerText = "Auteur";
        let inputBookAuthorElement = document.createElement("input");
        inputBookAuthorElement.type = "text";
        inputBookAuthorElement.setAttribute("id", "authorInput");

        let buttonSubmitElement = document.createElement("button");
        buttonSubmitElement.type = "submit";
        buttonSubmitElement.textContent = "Rechercher";

        let buttonCancelElement = document.createElement("button")
        buttonCancelElement.addEventListener("click", app.removeForm)

        subDivTitleElement.appendChild(labelBookTitleElement);
        subDivTitleElement.appendChild(inputBookTitleElement);
        subDivAuthorElement.appendChild(labelBookAuthorElement);
        subDivAuthorElement.appendChild(inputBookAuthorElement);

        formElement.appendChild(subDivTitleElement);
        formElement.appendChild(subDivAuthorElement);
        formElement.appendChild(buttonSubmitElement);

        divGroupElement.appendChild(formElement);

        app.hrElement.before(divGroupElement);

        formElement.addEventListener("submit", app.searchBook);
    },

    removeForm: function(evt){
        const divGroupElement = document.querySelector("#container");
        const parentDiv = divGroupElement.parentElement;
        parentDiv.removeChild(divGroupElement);
    },

    searchBook: function (evt) {
        evt.preventDefault();
        console.log("form submitted");
        let formElement = evt.currentTarget;
        //important part : the encoreURIComponent will convert the "firstname lastname" to "firstname%20lastname", usefull to write the uri for request
        let titleInputValue = encodeURIComponent(
            formElement.querySelector("#titleInput").value
        );
        let authorInputValue = encodeURIComponent(
            formElement.querySelector("#authorInput").value
        );

        console.log(titleInputValue + " " + authorInputValue);
        // "https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=yourAPIKey"
        let request =
            app.apiGoogleBooks +
            "volumes?q=" +
            titleInputValue +
            "+inauthor:" +
            authorInputValue +
            "&key=" +
            app.apiKey;
        const httpHeaders = new Headers();
        httpHeaders.append("Content-Type", "application/json");
        const fetchOptions = {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
            headers: httpHeaders,
        };

        fetch(request, fetchOptions)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
                bookArray = app.formatBookList(data);
                if (bookArray !== false){
                    books = app.showBookList(bookArray);
                    const divGroupElement = document.querySelector("#container");
                    let form = document.querySelector("form");
                    divGroupElement.removeChild(form)
                    divGroupElement.appendChild(books);
                    

                }
            })
            // .catch(function () {
            //     console.log("ERROR FETCH");
            // });
    },

    formatBookList: function (data) {
        if (data.items !== undefined) {
            let bookArray = [];
            const booksList = data.items;
            booksList.forEach((book) => {
                const id = book.id;
                const title = book.volumeInfo.title;
                const author = book.volumeInfo.authors[0];
                const description = book.volumeInfo.description
                    ? book.volumeInfo.description.slice(0, 200) + "..."
                    : "description indisponible";
                const image = book.volumeInfo.imageLinks
                    ? book.volumeInfo.imageLinks.thumbnail
                    : "./images/unavailable.png";
                console.log(id, title, author, description, image);
                bookArray.push({id, title, author,description,image})
            });
            console.log(bookArray);
            return bookArray;
        } else {
            console.log("livre ou auteur introuvable");
            return false;
        }
    },

    showBookList: function(bookArray){
        const resultDivElement = document.createElement("div");
        resultDivElement.setAttribute("id", "results")
        bookArray.forEach( book => {
            const divArticleElement = document.createElement("div");

            const titleH3Element = document.createElement("h3");
            titleH3Element.textContent = "Titre : " + book.title;

            const idH3Element = document.createElement("h3");
            idH3Element.textContent = "Id : " + book.id;

            const authorh3Element = document.createElement("h3");
            authorh3Element.textContent = "Auteur : " + book.author;

            const descriptionPElement = document.createElement("p");
            descriptionPElement.textContent = "Description : " + book.description;

            const imageDivElement = document.createElement("div");
            const imageImgElement = document.createElement("img");
            imageImgElement.src = book.image;
            imageDivElement.appendChild(imageImgElement);

            divArticleElement.appendChild(titleH3Element)
            divArticleElement.appendChild(idH3Element)
            divArticleElement.appendChild(authorh3Element)
            divArticleElement.appendChild(descriptionPElement)
            divArticleElement.appendChild(imageDivElement)

            resultDivElement.appendChild(divArticleElement)


        })
        return resultDivElement;
    }


};

document.addEventListener("DOMContentLoaded", app.init); // we launch the script at the end of the loading of the page
