## Fixes and improvements

-- task.status is obsolete in db. Check if it's use can be dropped and whether columnid where title is for example "todo" can be used

-- Refactor code so rerenders don't trigger so many action repetitions (i.e. calling useBoard)


# Bugs progress 

- Dragging cards squishes them - large task cards become small on dragOver. 

## Plans

[] Login and Sign up page:
    -Make it a modal that pops up when entering the site (Blur background). have 2 fields with a top selector - log in or register. Show a skeleton of the board in the blurred background. Upon login, render the last accessed board by account - save this board id in a parameter in the db - user -> last_accessed_board. 
[] Use react router for routes with board id's     
[] Make menu for changing boards 
[] Add option to give access to other users to a board.
[] Add side panel menu for all options (night mode, changing board, inviting users)
[] Add the option to delete tasks
[] Full screen view of task
[] Add sidebar on page which will contain all the buttons - Logout, Invite user to board, switch boards, nightmode button 
[] When adding a new board the name of the board should be unique to the user, on my boards view, display the board name and the owner of the board, since the names can be duplicating for two users. 

