// Simple navigation highlight script
document.addEventListener('DOMContentLoaded', function() {
    // Get all sections that have an ID defined
    const sections = document.querySelectorAll("section[id]");
    
    // Add an event listener listening for scroll
    window.addEventListener("scroll", navHighlighter);
    
    function navHighlighter() {
        // Get current scroll position
        let scrollY = window.pageYOffset;
        
        // Loop through sections to get height, top and ID values for each
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 50;
            const sectionId = current.getAttribute("id");
            
            // If our current scroll position enters the space where current section is, add .active class to corresponding navigation link
            // Otherwise remove it
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector("nav ul li a[href*=" + sectionId + "]").classList.add("active");
            } else {
                document.querySelector("nav ul li a[href*=" + sectionId + "]").classList.remove("active");
            }
        });
    }
    
    // Form submission handling
    const form = document.querySelector('form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        alert(`Thanks for your message, ${name}! This form is not actually connected to a backend yet.`);
        form.reset();
    });
});