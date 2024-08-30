from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
import random
import logging
import json

# Create your views here.

logger = logging.getLogger(__name__)

def initialize_game(request):
    request.session['grid'] = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]
    request.session['score'] = 0
    request.session['previous_grid'] = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]
    request.session['previous_score'] = 0
    add_random(request)
    add_random(request)

@require_http_methods(["GET", "POST"])
def game(request):
    if 'grid' not in request.session or 'score' not in request.session:
        initialize_game(request)

    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'undo':
            if 'previous_grid' in request.session and 'previous_score' in request.session:
                print(request.session['grid'])
                print(request.session['previous_grid'])
                request.session['grid'] = request.session['previous_grid']
                request.session['score'] = request.session['previous_score']

        else:
            # Store current state before making a move
            request.session['temp_grid'] = [row[:] for row in request.session['grid']]
            request.session['temp_score'] = request.session['score']

            direction = request.POST.get('direction')
            if direction == 'up':
                move_up(request)
            elif direction == 'down':
                move_down(request)
            elif direction == 'left':
                move_left(request)
            elif direction == 'right':
                move_right(request)
            
            if request.session['grid'] != request.session['temp_grid']:
                add_random(request)
                request.session['previous_grid'] = [row[:] for row in request.session['temp_grid']]
                request.session['previous_score'] = request.session['temp_score']

        request.session.modified = True

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'grid': request.session['grid'],
                'score': request.session['score']
            })

    logger.info(f"Current grid: {request.session['grid']}")
    context = {
        'grid': request.session['grid'],
        'score': request.session['score']
    }
    return render(request, 'game/game.html', context)

def reset(request):
    if 'grid' in request.session:
        del request.session['grid']
    if 'score' in request.session:
        del request.session['score']
    if 'previous_grid' in request.session:
        del request.session['previous_grid']
    if 'previous_score' in request.session:
        del request.session['previous_score']
    return redirect('game')

def add_random(request):
    grid = request.session['grid']
    empty_cells = [(i, j) for i in range(4) for j in range(4) if grid[i][j] == 0]
    if empty_cells:
        i, j = random.choice(empty_cells)
        grid[i][j] = 2 if random.random() < 0.9 else 4
        request.session['grid'] = grid

def reset_grid_merged(grid_merged):
    return [
        [False, False, False, False],
        [False, False, False, False],
        [False, False, False, False],
        [False, False, False, False]
    ]

def move_left(request):
    grid = request.session['grid']
    grid_merged = reset_grid_merged(grid)
    
    for x in range(4):
        for y in range(1, 4):
            if grid[y][x] != 0:
                for y2 in range(y-1, -1, -1):
                    if grid[y2][x] == 0:
                        grid[y2][x] = grid[y2+1][x]
                        grid[y2+1][x] = 0
                    elif grid[y2][x] == grid[y2+1][x] and not grid_merged[y2][x]:
                        grid[y2][x] *= 2
                        request.session['score'] += grid[y2][x]  # Add to the cumulative score
                        grid_merged[y2][x] = True
                        grid[y2+1][x] = 0
                        break
                    else:
                        break
    
    request.session['grid'] = grid

def move_right(request):
    grid = request.session['grid']
    grid_merged = reset_grid_merged(grid)
    
    for x in range(4):
        for y in range(2, -1, -1):
            if grid[y][x] != 0:
                for y2 in range(y+1, 4):
                    if grid[y2][x] == 0:
                        grid[y2][x] = grid[y2-1][x]
                        grid[y2-1][x] = 0
                    elif grid[y2][x] == grid[y2-1][x] and not grid_merged[y2][x]:
                        grid[y2][x] *= 2
                        request.session['score'] += grid[y2][x]
                        grid_merged[y2][x] = True
                        grid[y2-1][x] = 0
                        break
                    else:
                        break
    
    request.session['grid'] = grid

def move_up(request):
    grid = request.session['grid']
    grid_merged = reset_grid_merged(grid)
    
    for y in range(4):
        for x in range(1, 4):
            if grid[y][x] != 0:
                for x2 in range(x-1, -1, -1):
                    if grid[y][x2] == 0:
                        grid[y][x2] = grid[y][x2+1]
                        grid[y][x2+1] = 0
                    elif grid[y][x2] == grid[y][x2+1] and not grid_merged[y][x2]:
                        grid[y][x2] *= 2
                        request.session['score'] += grid[y][x2]
                        grid_merged[y][x2] = True
                        grid[y][x2+1] = 0
                        break
                    else:
                        break
    
    request.session['grid'] = grid

def move_down(request):
    grid = request.session['grid']
    grid_merged = reset_grid_merged(grid)
    
    for y in range(4):
        for x in range(2, -1, -1):
            if grid[y][x] != 0:
                for x2 in range(x+1, 4):
                    if grid[y][x2] == 0:
                        grid[y][x2] = grid[y][x2-1]
                        grid[y][x2-1] = 0
                    elif grid[y][x2] == grid[y][x2-1] and not grid_merged[y][x2]:
                        grid[y][x2] *= 2
                        request.session['score'] += grid[y][x2]
                        grid_merged[y][x2] = True
                        grid[y][x2-1] = 0
                        break
                    else:
                        break
    
    request.session['grid'] = grid
