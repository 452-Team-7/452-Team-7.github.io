let housing_providers_div = document.getElementById('verify_housing_providers')
let listings_div = document.getElementById('verify_listings')

async function get_housing_providers() {

    try{
        const response = await fetch ("http://localhost:8080/verify/housing-providers", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'Access-Control-Allow-Origin':'*'
            },
        })

        const result = await response.json()
        console.log(result)
        if (result.length == 0) {
            let new_h2 = document.createElement("h2")
            new_h2.innerHTML = "No Housing Providers to Verify!"
            housing_providers_div.append(new_h2)
        } 

        else{

        
            let new_div = document.createElement("div")
            let request_number = document.createElement("h2")
            let username = document.createElement("h3")
            let full_name = document.createElement("h3")
            let first_id_label = document.createElement("h3")
            let first_id_img = document.createElement("img")
            let second_id_label = document.createElement("h3")
            let second_id_img = document.createElement("img")
            
            username.innerHTML = "Username: " + result[0].username
            full_name.innerHTML = "Full Name " + result[0].full_name
            first_id_img.src=result[0].first_id_link
            second_id_img.src = result[0].second_id_link
            first_id_label.innerHTML = "ID #1:"
            second_id_label.innerHTML = "ID #2:"

            new_div.append(request_number)
            new_div.append(username)
            new_div.append(full_name)
            new_div.append(first_id_label)
            new_div.append(first_id_img)
            new_div.append(second_id_label)
            new_div.append(second_id_img)

            new_div.classList.add("user_details")
            console.log(new_div.classList)

            housing_providers_div.append(new_div)
            console.log(housing_providers_div)
        }

        

    }

    catch (err) {
        console.log("Error: " + err)
    }
}

get_housing_providers()

async function get_listing() {

    try{
        const response = await fetch ("http://localhost:8080/verify/listings", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'Access-Control-Allow-Origin':'*'
            },
        })

        const result = await response.json()
        console.log(result)
        if (result.length == 0) {
            let new_h2 = document.createElement("h2")
            new_h2.innerHTML = "No Listings to Verify!"
            listings_div.append(new_h2)
        } 

        else{

            let username = document.createElement("h3")
            let street = document.createElement("h3")
            let city = document.createElement("h3")
            let state = document.createElement("h3")
            let zipcode = document.createElement("h3")
            let building_type = document.createElement("h3")
            let price = document.createElement("h3")
            let availability = document.createElement("h3")
            let rooms = document.createElement("h3")
            let description = document.createElement("h3")
            let purchase_type = document.createElement("h3")
            let deed_label = (document.createElement("h3").innerHTML = "Deed: ")
            let deed = document.createElement("a")



            
            username.innerHTML = "Provider Username: " + result[0].provider_username
            street.innerHTML = "Street: " + result[0].street_address
            city.innerHTML = "City: " + result[0].city
            state.innerHTML = "State: " + result[0].state
            zipcode.innerHTML = "Zipcode: " + result[0].zipcode
            building_type.innerHTML = "Building Type: " + result[0].building_type
            price.innerHTML = "Price: $" + result[0].price
            availability.innerHTML = "Availability: " + ((result[0].availability == 1 ? "Available" : "Unavailable"))
            rooms.innerHTML = "Rooms: " + result[0].rooms
            description.innerHTML = "Description: " + result[0].description
            purchase_type.innerHTML = "Purchase Type: " + result[0].purchase_type

            deed.href = result[0].deed_link
            
            new_div.append(username)
            new_div.append(street)
            new_div.append(city)
            new_div.append(state)
            new_div.append(zipcode)
            new_div.append(purchase_type)
            new_div.append(building_type)
            new_div.append(price)
            new_div.append(availability)
            new_div.append(rooms)
            new_div.append(description)
            new_div.append(deed_label)
            new_div.append(deed)


            new_div.classList.add("user_details")
            console.log(new_div.classList)

            housing_providers_div.append(new_div)
            console.log(housing_providers_div)
        }

        

    }

    catch (err) {
        console.log("Error: " + err)
    }

    

}

get_listing();















document.getElementById('accept_button').addEventListener("click", (e) => {
    e.preventDefault()
    var verify_form = document.forms.verify_form;

    let form = new FormData(verify_form)
    async function accept(data) {

        try{
            const response = await fetch ("http://localhost:8080/verify/housing-providers?username="+form.get('username')+"&verified_status=1", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Access-Control-Allow-Origin':'*'
                },
            })
    
            if (response.message == "Account status updated, successfully accepted"){
                alert('Account Successfuly Verified')
                window.location.reload()
            }
        }
        catch (err) {
            console.log("Error: " + err)
        }
    }

    accept(form)
})
