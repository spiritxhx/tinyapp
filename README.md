# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). This is also my 1st personnal full stack application. The product is for learning only. 

## Final Product

!["first page"](https://github.com/spiritxhx/tinyapp/blob/master/img/urls.png)
Users will go to this page by default, users can log in and register before they can create or have access to the shortURLs. 

!["page after login"](https://github.com/spiritxhx/tinyapp/blob/master/img/login.png)
After logged in or registered, users can see the list of urls created by them, they can also edit or delete the urls. 

!["edit page with visit count"](https://github.com/spiritxhx/tinyapp/blob/master/img/editWithCount.png)
In the edit page, users can edit the longURL of the shortURL, and users can see the visit times of the shortURLs. 

!["log in with no shortURLs"](https://github.com/spiritxhx/tinyapp/blob/master/img/noShortURLs.png)
When users logged in with no shortURLs on their own, the app will ask user to create a new shortURL. 

!["edit without logged in"](https://github.com/spiritxhx/tinyapp/blob/master/img/urls.png)
When users who did not log in try to create a nre shortURL, it will redirect them to the login page bacause this function is for logged in users only. 

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.