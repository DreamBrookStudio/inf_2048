document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('undo-button').addEventListener('click', handleUndo);
    document.getElementById('new-game-button').addEventListener('click', handleNewGame);

    const grid = document.getElementById('grid');
    grid.addEventListener('touchstart', handleTouchStart, { passive: false });
    grid.addEventListener('touchmove', handleTouchMove, { passive: false });
    grid.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Prevent scrolling when touching the grid
    grid.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
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

function handleNewGame() {
    fetch(resetUrl, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
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

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    touchEndX = event.touches[0].clientX;
    touchEndY = event.touches[0].clientY;
}

function handleTouchEnd() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipeDistance = 50; // minimum distance to be considered a swipe

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) {
                makeMove('left');
            } else {
                makeMove('right');
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(diffY) > minSwipeDistance) {
            if (diffY > 0) {
                makeMove('up');
            } else {
                makeMove('down');
            }
        }
    }

    // Reset values
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
}
