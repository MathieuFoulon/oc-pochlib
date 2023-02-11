const app = {
    apiGoogleBooks: "https://www.googleapis.com/books/v1/",
    apiKey: "AIzaSyBIKKDA_pihtlLbSfjFPWY3iK4AfcRbj6g",
    myBooksElement: document.querySelector("#myBooks"),
    contentElement: document.querySelector("#content"),
    hrElement: document.querySelector("hr"),

    // function launched first ( see last line of the code )
    init: function () {
        const divBeforeHrElement = document.createElement("section");
        app.hrElement.before(divBeforeHrElement);
        divBeforeHrElement.setAttribute("id", "globalDiv");
        app.createBookmarkedDivContainerElement()
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

    createBookmarkedDivContainerElement: function(){
        const bookmarkedDivContainerElement = document.createElement("section")
        bookmarkedDivContainerElement.classList.add("container");
        bookmarkedDivContainerElement.setAttribute("id", "bookmarked")

        app.contentElement.appendChild(bookmarkedDivContainerElement)
        app.getBookmarkedBooks()
    },

    getBookmarkedBooks: function(){
        
        const bookmarkedDivContainerElement = document.querySelector("#bookmarked");
        if ( document.querySelectorAll(".pochListBooks")){
            bookmarkedDivContainerElement.innerHTML = "";
        }
        for (let i = 0; i < sessionStorage.length; i++) {

                const value = sessionStorage.getItem(sessionStorage.key(i));
                const bookId = sessionStorage.key(i);

                if (bookId != "IsThisFirstTime_Log_From_LiveServer") {
                    // const dummyDivElement = document.createElement("div");
                    // dummyDivElement.innerHTML = value;
                    // bookmarkedDivContainerElement.appendChild(dummyDivElement);
                    const articleAndTrashContainerElement= document.createElement("article");
                    articleAndTrashContainerElement.classList.add("pochlistBooks")
                    articleAndTrashContainerElement.setAttribute("id", bookId);
                    articleAndTrashContainerElement.innerHTML = value;
                    bookmarkedDivContainerElement.appendChild(articleAndTrashContainerElement);

                    
                    const bookmarkIconElement = bookmarkedDivContainerElement.querySelector(".fa-bookmark");
                    bookmarkIconElement.className = "fas fa-trash";

                    
                    bookmarkIconElement.addEventListener("click", function() {
                        sessionStorage.removeItem(bookId);
                        console.log("click")
                        articleAndTrashContainerElement.parentElement.removeChild(articleAndTrashContainerElement);
                    })
                }
        }
    },

    // makes the button to disappear and show form
    addBook: function (evt) {
        console.log("bouton Ajouter un livre cliqué");
        const globalDiv = document.querySelector("#globalDiv");
        globalDiv.removeChild(evt.currentTarget)
        app.createForm();
    },

    createForm: function () {
        const globalDiv = document.querySelector("#globalDiv");
        const divGroupElement = document.createElement("div");
        divGroupElement.classList.add("container");
        divGroupElement.setAttribute("id", "container");

        const formElement = document.createElement("form");
        formElement.classList.add("form", "container");
        formElement.setAttribute("id", "form")

        const subDivTitleElement = document.createElement("div");
        const subDivAuthorElement = document.createElement("div");

        const labelBookTitleElement = document.createElement("label");
        labelBookTitleElement.innerText = "Titre du livre";
        const inputBookTitleElement = document.createElement("input");
        inputBookTitleElement.type = "text";
        inputBookTitleElement.setAttribute("id", "titleInput");

        const labelBookAuthorElement = document.createElement("label");
        labelBookAuthorElement.innerText = "Auteur";
        const inputBookAuthorElement = document.createElement("input");
        inputBookAuthorElement.type = "text";
        inputBookAuthorElement.setAttribute("id", "authorInput");

        const buttonSubmitElement = document.createElement("button");
        buttonSubmitElement.type = "submit";
        buttonSubmitElement.textContent = "Rechercher";

        const buttonCancelElement = document.createElement("button");
        buttonCancelElement.className = "red"
        buttonCancelElement.textContent = "Annuler";
        buttonCancelElement.addEventListener("click", app.removeForm);

        subDivTitleElement.appendChild(labelBookTitleElement);
        subDivTitleElement.appendChild(inputBookTitleElement);
        subDivAuthorElement.appendChild(labelBookAuthorElement);
        subDivAuthorElement.appendChild(inputBookAuthorElement);

        formElement.appendChild(subDivTitleElement);
        formElement.appendChild(subDivAuthorElement);
        formElement.appendChild(buttonSubmitElement);
        formElement.appendChild(buttonCancelElement);

        formElement.addEventListener("submit", app.searchBook);

        divGroupElement.appendChild(formElement);

        globalDiv.appendChild(divGroupElement)

        
    },

    removeForm: function(evt){
        const divGroupElement = document.querySelector("#container");
        const parentDiv = divGroupElement.parentElement;
        parentDiv.removeChild(divGroupElement);
        app.createAndPlaceAddBookButton()
    },

    searchBook: function (evt) {
        evt.preventDefault();
        const resultDivElement = document.querySelector("#results") ? document.querySelector("#results").remove() : document.querySelector("#results");
        console.log("form submitted");
        const formElement = evt.currentTarget;
        //important part : the encodeURIComponent will convert the "firstname lastname" to "firstname%20lastname", usefull to write the uri for request
        const titleInputValue = encodeURIComponent(
            formElement.querySelector("#titleInput").value
        );
        const authorInputValue = encodeURIComponent(
            formElement.querySelector("#authorInput").value
        );

        let request;
        // "https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=yourAPIKey"
        if( titleInputValue !== "" && authorInputValue !== ""){
            request =
                app.apiGoogleBooks +
                "volumes?q=intitle:" +
                titleInputValue +
                "+inauthor:" +
                authorInputValue +
                "&key=" +
                app.apiKey;
        } else if (titleInputValue !== "" && authorInputValue === ""){
            request = app.apiGoogleBooks +
                "volumes?q=intitle:" +
                titleInputValue +
                "&key=" +
                app.apiKey;
        } else if (titleInputValue === "" && authorInputValue !== ""){
            request = app.apiGoogleBooks +
                "volumes?q=inauthor:" +
                authorInputValue +
                "&key=" +
                app.apiKey;
        } else {
            return;
        }
        
        

        fetch(request)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
                bookArray = app.formatBookList(data);
                if (bookArray !== false){
                    books = app.showBookList(bookArray);
                    const divGroupElement = document.querySelector("#container");
                    const h3ErrorElement = document.querySelector("#errorH3") ? divGroupElement.removeChild(document.querySelector("#errorH3")) : null;
                    divGroupElement.appendChild(books);
                    
                    

                } else {
                    const divGroupElement = document.querySelector("#container");
                    const h3ErrorElement = document.createElement("h3");
                    h3ErrorElement.setAttribute("id", "errorH3");
                    h3ErrorElement.textContent = "Aucun livre n'a été trouvé";
                    const books = document.querySelector("#results") ? divGroupElement.removeChild(document.querySelector("#results")) : null;
                    divGroupElement.appendChild(h3ErrorElement);
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

            //container for book info and bookmark
            const divArticleAndBookmarkElement = document.createElement("div");
            divArticleAndBookmarkElement.classList.add("articleAndBookmark");
            divArticleAndBookmarkElement.setAttribute("id", book.id)

            //container of book info
            const divArticleElement = document.createElement("article");
            divArticleElement.classList.add("articleBook");

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

            // container of bookmark
            const bookmarkDivElement = document.createElement("div");
            bookmarkDivElement.classList.add("divBookmark");

            const bookmarkIconElement = document.createElement("i");
            bookmarkIconElement.classList.add("fas","fa-bookmark");
            bookmarkIconElement.setAttribute("book", book.id);
            bookmarkIconElement.addEventListener("click", app.addBookmarkedBookToPochliste)

            bookmarkDivElement.appendChild(bookmarkIconElement);


            divArticleAndBookmarkElement.appendChild(divArticleElement);
            divArticleAndBookmarkElement.appendChild(bookmarkDivElement);

            resultDivElement.appendChild(divArticleAndBookmarkElement);


        })
        return resultDivElement;
    },

    addBookmarkedBookToPochliste: function(evt){
        console.log("bookmark clické");
        const bookmarkIconElement = evt.target;
        
        const bookmarkIconAttributes = bookmarkIconElement.attributes;
        let bookId;
        Array.prototype.slice.call(bookmarkIconAttributes).forEach(function(item) {
            console.log(item.name + ': '+ item.value);
            if (item.name === "book"){
                bookId = item.value;
            }
        });

        if (sessionStorage.getItem(bookId)) {
            alert("Vous ne pouvez ajouter deux fois le même livre.");
            return;
        }


        const dummyDivElement = document.createElement("div");
        dummyDivElement.innerHTML = evt.target.parentElement.parentElement.innerHTML;


        sessionStorage.setItem(bookId, dummyDivElement.innerHTML);
        app.getBookmarkedBooks();
    },



};

document.addEventListener("DOMContentLoaded", app.init); // we launch the script at the end of the loading of the page
