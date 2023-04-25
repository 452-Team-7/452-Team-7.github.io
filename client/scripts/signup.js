var submit_buttom = document.getElementById('submit_signup').addEventListener("click", (e) => {
    e.preventDefault();
    var signup_form = document.forms.signup_form;

    console.log(signup_form);


    let form = new FormData(signup_form);
    console.log(form);
    $.ajax({
        url: "http://localhost:8080/signup",
        data: form,
        processData: false,
        contentType: false,
        crossDomain: true,
        enctype: 'multipart/form-data',
        type: 'POST',
        success: (data) => {
            console.log(data)
            alert("Account created");
        },
        error: (error) => {
        }
    })


});