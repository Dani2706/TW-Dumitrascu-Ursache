function loadHtmlIntoMain(htmlFile, callback) {
    if (htmlFile === 'property.html') {
        if (!document.querySelector('link[href="css/property.css"]')) {
            const propertyStyle = document.createElement('link');
            propertyStyle.rel = 'stylesheet';
            propertyStyle.href = 'css/property.css';
            document.head.appendChild(propertyStyle);
        }
    }

    fetch(htmlFile)
        .then(response => {
            if (!response.ok) throw new Error(`Eroare la încărcarea ${htmlFile}`);
            return response.text();
        })
        .then(html => {
            const container = document.getElementById("main-content");
            container.innerHTML = html;
            if (typeof callback === "function") {
                callback();
            }

            if(htmlFile === 'property.html') {
                slideIndex = 1;
                showSlides(slideIndex);
            }
        })
        .catch(error => {
            console.error("Eroare la încărcarea paginii:", error);
            document.getElementById("main-content").innerHTML =
                "<p style='color: red;'>Nu am putut încărca pagina cerută.</p>";
        });
}

function loadPropertyDetails(id) {
    console.log(`Attempting to fetch property with id: ${id}`);
    fetch(`/TW_Dumitrascu_Ursache_war/property?id=${id}`)
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) throw new Error("Proprietatea nu a fost găsită");
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            document.getElementById("property-title").textContent = data.title;
            document.getElementById("property-price").textContent = data.price;
            document.getElementById("property-surface").textContent = data.surface;
            document.getElementById("property-rooms").textContent = data.rooms;
            document.getElementById("property-floor").textContent = data.floor;
            document.getElementById("property-year").textContent = data.yearBuilt;
            document.getElementById("property-description").textContent = data.description;
            document.getElementById("property-address").textContent = data.address + ", " + data.city + ", " + data.state;
            document.getElementById("property-contact-name").textContent = data.contactName;
            document.getElementById("property-contact-phone").textContent = data.contactPhone;
            document.getElementById("property-contact-email").textContent = data.contactEmail;
            //document.getElementById("property-image").src = data.imageUrl;
        })
        .catch(error => {
            console.error("Detailed error:", error);
            document.getElementById("main-content").innerHTML = "<p>Nu s-au putut încărca detaliile.</p>";
        });
}



function plusSlides(n) {
    showSlides(slideIndex += n);
}
function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slides");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex-1].style.display = "block";
}
