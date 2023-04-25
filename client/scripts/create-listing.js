localStorage.setItem('username','bob1')
var username = localStorage.getItem('username');

var submit_buttom = document.getElementById('submit_listing').addEventListener("click", (e) => {
    e.preventDefault();
    var listing_form = document.forms.listing_form;

    console.log(listing_form);


    let form = new FormData(listing_form);
    form.append('provider_username',username);
    console.log(form);
    $.ajax({
        url: "http://localhost:8080/listings",
        data: form,
        processData: false,
        contentType: false,
        crossDomain: true,
        enctype: 'multipart/form-data',
        type: 'POST',
        success: (data) => {
            alert("Listing creation request placed, our team will verify the details that you provided before it is posted for tenants to see. Thank you.");
        },
        error: (error) => {
        }
    })


});
