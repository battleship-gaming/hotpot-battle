document.addEventListener('DOMContentLoaded', () => {
    const gridUser = document.querySelector('.grid-user');
    const gridOpponent = document.querySelector('.grid-opponent');
    const squaresUser = [];
    const squaresOpponent = [];
    const width = 8;
    
    const ingr0 = document.querySelector('.ingr0');
    const ingr1 = document.querySelector('.ingr1');
    const ingr2 = document.querySelector('.ingr2');
    const ingr3 = document.querySelector('.ingr3');
    let isHor = true    
    const rotateBtn = document.querySelector('#rotate-btn');

    

    createPot(gridUser, squaresUser)
    createPot(gridOpponent, squaresOpponent)
    
    function createPot(gridPlayer, squares) {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.dataset.id = i
            gridPlayer.appendChild(square)
            squares.push(square)
        }
    };    

    function rotateFood() {
        if (isHor) {
            ingr0.classList.toggle('ingr0-vert')
            ingr1.classList.toggle('ingr1-vert')
            ingr2.classList.toggle('ingr2-vert')
            ingr3.classList.toggle('ingr3-vert')
            isHor = false
            return
        }
        if (!isHor) {
            ingr0.classList.toggle('ingr0-vert')
            ingr1.classList.toggle('ingr1-vert')
            ingr2.classList.toggle('ingr2-vert')
            ingr3.classList.toggle('ingr3-vert')
            isHor = true
            return
        }
    };
    rotateBtn.addEventListener('click', rotateFood)

})