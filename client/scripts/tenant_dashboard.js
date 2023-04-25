document.getElementById('submit_search').addEventListener("click", (e) => {
    var search_form = document.forms.search_form;

    let form = new FormData(search_form);
    
    console.log(form);
    // $.ajax({
    //     url: "http://localhost:8080/listi",
    //     data: form,
    //     processData: false,
    //     contentType: false,
    //     crossDomain: true,
    //     enctype: 'application/x-www-form-urlencoded',
    //     type: 'GET',
    //     success: (data) => {
    //         console.log(d)
    //         alert("Listing creation request placed, our team will verify the details that you provided before it is posted for tenants to see. Thank you.");
    //     },
    //     error: (error) => {
    //     }
    // })

    async function postJSON(data) {

        try{
            const response = await fetch ("http://localhost:8080/listings?zipcode="+form.get('zipcode')+"&city="+form.get('city')+"&state="+form.get('state')+"&purchase_type="+form.get('purchase_type'), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const result = await response.json()
            console.log("Success")
        }

        catch (err) {
            console.log("Error: " + err)
        }


    }

    postJSON(form)

})