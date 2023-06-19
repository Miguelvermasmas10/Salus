var userName = null;

fetch('/dokumente/info')
    .then(response => {
        response.text().then(data => {
            userName = data;
            console.log(userName);

            $("#welcome_userName").text("Willkommen, " + userName + "!");
        });
    }).catch(error => {
        console.error(error);
    }
);