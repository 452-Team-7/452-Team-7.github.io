var submit_buttom = document.getElementById('submit_login').addEventListener("click", (e) => {
    e.preventDefault();
    var login_form = document.forms.login_form;

    console.log(login_form);


    let form = new FormData(login_form);
    console.log(form);


    async function postJSON(data) {

        try{
            const response = await fetch ("http://localhost:8080/login?username="+form.get('username')+"&password="+form.get('password'), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Access-Control-Allow-Origin':'*'
                },
            })

            const result = await response.json()
            console.log(result)

            /* Make sure that log in was sucessfull*/
            if (result.message == "Login successful") {
                localStorage.setItem('username',result.username)
                localStorage.setItem('role',result.role)


                /* Navigate user to the correct dashboard*/
                if (result.role == "housing_provider") {
                    window.location.href = "../pages/housing_provider_client/create_listing.html"
                }
                else if (result.role == "employee") {
                    window.location.href= "../pages/employee_client/employee_dashboard.html"
                }
                else{
                    window.location.href = "../pages/tenant_client/search_listings.html"
                }


            }

            else{
                alert("Log in failed, please try again")

            }
        }

        catch (err) {
            console.log("Error: " + err)
        }
    }


    postJSON(form)


});