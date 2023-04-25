document.addEventListener("DOMContentLoaded", (e) => {

    var search_form = document.forms.search_form;

    let form = new FormData(search_form);
    
    var username = localStorage.getItem('username')
    console.log(form);

    let verified_div = document.getElementById('verified_listings')
    let unverified_div = document.getElementById('unverified_listings')




    async function postJSON(data) {

        try{
            const response = await fetch ("http://localhost:8080/listings?zipcode="+"&city="+"&state="+"&purchase_type="+"&username=" + username, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const result = await response.json()
            
            if (result.length == 0) {
                /* Created verified listings and unverified listings header*/
                let ver_header = document.createElement('h2')
                ver_header.innerHTML = "Verified Listings:"
                verified_div.append(ver_header)
                let v = document.createElement('h3')
                v.innerHTML = "No verified listings found"
                verified_div.append(v)
                let unver_header = document.createElement('h2')
                unver_header.innerHTML = "Unverified Listings:"
                unverified_div.append(unver_header)
                v = document.createElement('h3')
                v.innerHTML = "No unverified listings found"
                unverified_div.append(v)
            } 
    
            else{

                let ver_header = document.createElement('h2')
                ver_header.innerHTML = "Verified Listings:"
                verified_div.append(ver_header)
                let unver_header = document.createElement('h2')
                unver_header.innerHTML = "Unverified Listings:"
                unverified_div.append(unver_header)

                let number_verified = 0
                let number_unverified = 0


                for (let i = 0; i < result.length; i++){

                    let new_div = document.createElement("div")
                    new_div.classList.add('listing')
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
    
                    
                    let verified_status = result[i].verified_status
    
                    street.innerHTML = "Street: " + result[i].street_address
                    city.innerHTML = "City: " + result[i].city
                    state.innerHTML = "State: " + result[i].state
                    zipcode.innerHTML = "Zipcode: " + result[i].zipcode
                    building_type.innerHTML = "Building Type: " + result[i].building_type
                    price.innerHTML = "Price: $" + result[i].price
                    availability.innerHTML = "Availability: " + ((result[i].availability == 1 ? "Available" : "Unavailable"))
                    rooms.innerHTML = "Rooms: " + result[i].rooms
                    description.innerHTML = "Description: " + result[i].description
                    purchase_type.innerHTML = "Purchase Type: " + result[i].purchase_type
                    
    
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
    
                    if (verified_status == 1) {
                        verified_div.append(new_div)
                        number_verified++
                    }
                    else{
                        unverified_div.append(new_div)
                        number_unverified++
                    }

                }

                if(number_verified == 0){
                    let v = document.createElement('h3')
                    v.innerHTML = "No verified listings found"
                    verified_div.append(v)
                }

                if(number_unverified == 0){
                    let v = document.createElement('h3')
                    v.innerHTML = "No unverified listings found"
                    unverified_div.append(v)

                }


            }



        }

        catch (err) {
            console.log("Error: " + err)
        }


    }

    postJSON(form)

})