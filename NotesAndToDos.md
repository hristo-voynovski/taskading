## Fixes and improvements

-- task.status is obsolete in db. Check if it's use can be dropped and whether columnid where title is for example "todo" can be used

-- Refactor code so rerenders don't trigger so many action repetitions (i.e. calling useBoard)


# Bugs progress 

-column.id is not being set properly because the status property of a task has been removed
