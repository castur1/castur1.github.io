document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll("section[id]");
    
    window.addEventListener("scroll", navHighlighter);
    
    function navHighlighter() {
        let scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute("id");
            

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector("nav ul li a[href*=" + sectionId + "]").classList.add("active");
            } else {
                document.querySelector("nav ul li a[href*=" + sectionId + "]").classList.remove("active");
            }
        });
    }
    
    const form = document.querySelector('form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('subject').value;
        const recipientEmail = 'Casperture@gmail.com';
        const subject = encodeURIComponent('New message from your website');
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

        const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

        localStorage.setItem('mailtoLink', mailtoLink);

        window.location.href = "thank_you.html";
    });
});