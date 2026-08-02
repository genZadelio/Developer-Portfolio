const text = [
    "Python Functioner",
    "JavaScript Functioner",
    "AI Researcher",
    "Frontend Enhancer"
];

let index = 0;
let charIndex = 0;
const typing = document.getElementById("typing");

function typeEffect() {
    if (charIndex < text[index].length) {
        typing.textContent += text[index].charAt(charIndex);
        charIndex++;
        setTimeout(typeEffect, 100);
    } else {
        setTimeout(eraseEffect, 1500);
    }
}

function eraseEffect() {
    if (charIndex > 0) {
        typing.textContent =
            text[index].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseEffect, 50);
    } else {
        index++;
        if (index >= text.length) {
            index = 0;
        }
        setTimeout(typeEffect, 500);
    }
}

window.onload = typeEffect;