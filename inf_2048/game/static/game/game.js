document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', handleKeyPress);
    document.querySelectorAll('.controls button[data-direction]').forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });
    document.getElementById('undo-button').addEventListener('click', handleUndo);
});

function handleKeyPress(event) {
    let direction;
    switch(event.key) {
        case 'ArrowUp': direction = 'up'; break;
        case 'ArrowDown': direction = 'down'; break;
        case 'ArrowLeft': direction = 'left'; break;
        case 'ArrowRight': direction = 'right'; break;
        default: return;
    }
    event.preventDefault();
    makeMove(direction);
}

function handleButtonClick(event) {
    const direction = event.target.getAttribute('data-direction');
    makeMove(direction);
}

function handleUndo() {
    fetch('', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: 'action=undo'
    })
    .then(response => response.json())
    .then(data => {
        updateGrid(data.grid);
        document.getElementById('score').textContent = data.score;
    });
}

function makeMove(direction) {
    fetch('', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: `direction=${direction}`
    })
    .then(response => response.json())
    .then(data => {
        updateGrid(data.grid);
        document.getElementById('score').textContent = data.score;
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function updateGrid(grid) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const value = grid[Math.floor(index / 4)][index % 4];
        cell.className = `cell cell-${value}`;
        cell.textContent = value || '';
    });
}
