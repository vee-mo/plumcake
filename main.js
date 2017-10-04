// jscs:disable maximumLineLength
// jshint esversion: 6
/*use strict*/

//Object that contains all TODO function.
const ENTER_KEY = 13;
const ESCAPE_KEY = 27;
const inputIdFilter = /[0-9a-z]{4,12}-{0,1}/ig;

var todoList = {
  todos: [],
  filter: 'all',
  addTodo: function(todoText) {
      this.todos.push({
          todoText: todoText,
          completed: false,
          uuid: util.createUUID()
        });
    },
  changeTodo: function(position, todoText) {
      this.todos[position].todoText = todoText;
    },
  deleteTodo: function(uuid) {
      this.todos.forEach(function(todo, i) {
          if (todo.uuid === uuid) {
              this.todos.splice(i, 1);
          }
      }, this); //splice(position, 1);
    },
  toggleCompleted: function(uuid) {
      this.todos.forEach(function(todo, i) {
          if (todo.uuid === uuid) {
              todo.completed = !todo.completed;
          }
      }, this);
    },
  toggleAll: function() {
    let totalTodos = this.todos.length;
    let completedTodos = 0;

    this.todos.forEach(function(todo) {
      if (todo.completed === true) {
        completedTodos++;
      }
    });
    this.todos.forEach(function(todo) {
      if (completedTodos === totalTodos) {
        todo.completed = false;
      } else {
        todo.completed = true;
      }
    });
  },
  countActiveTodo: function() {
    let count = 0;
    this.todos.forEach(function(todo) {
      if (!todo.completed) {
        count++;
      }
    });
    return count;
  },
  getFilteredTodos: function() {
    switch (this.filter) {
      case 'all':
        return this.todos;
      case 'active':
        return this.todos.filter(function(todo) {
          return !todo.completed;
        }, this);
      case 'completed':
        return this.todos.filter(function(todo) {
          return todo.completed;
        }, this);
    }
  },
    //deleteCompleted does not delete all of the completed todos
  deleteCompletedTodos: function() {
    this.todos.forEach(function(todo, i) {
      if (todo.completed === true) {
        this.todos.splice(i, 1);
      }
    }, this);
  }
};

let util = {
    createUUID: function() {  
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {  
      var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);  
      return v.toString(16);  
   });  
} 
}
//TODO: Select button to Display Todos
var handlers = {
  addTodo: function(event) {
    let addTodoTextInput = document.getElementById('addTodoTextInput');
    if (event.target === addTodoTextInput && event.keyCode === ENTER_KEY) {
      if (addTodoTextInput.value !== '') {
        todoList.addTodo(addTodoTextInput.value);
        addTodoTextInput.value = '';
        view.displayTodos();
      }
    } else if (event.target === addTodoTextInput && event.keyCode === ESCAPE_KEY) {
      addTodoTextInput.value = '';
      addTodoTextInput.blur();
      view.displayTodos();
    }
  },
  changeTodo: function(position, todoText) {
    todoList.changeTodo(position, todoText);
    view.displayTodos();
  },
  deleteTodo: function(uuid) {
    todoList.deleteTodo(uuid);
    view.displayTodos();
  },
  toggleCompleted: function(event) {
    let targetData = event.target.data;
    if (targetData.match(inputIdFilter)) {
        //Use .children the forEach to look for .data attribute to match UUID???
      let uuidToToggle = event.target.parentNode.parentNode.id;
      todoList.toggleCompleted(uuidToToggle);
      view.displayTodos();
    }
  },
  editTodo: function(event) {
    //TODO: event listeners in view module. Sort them out
    //move let outside if statement
    if (event.target.previousSibling.id.match(inputIdFilter)) {
      let todosInputLabel = event.target;
      let inputToHide = todosInputLabel.previousSibling;
      let inputToShow = todosInputLabel.nextSibling;
      let parentLiPosition = todosInputLabel.parentNode.parentNode.id;
      let originalValue = inputToShow.value; //don't like it
      let that = this; //don't like it

      todosInputLabel.className = 'edit';
      inputToHide.className = 'edit';
      inputToShow.className = 'editing';
      inputToShow.focus();
      inputToShow.select();
      inputToShow.addEventListener('blur', function(event) {
        let todoText = inputToShow.value;
        that.changeTodo(parentLiPosition, todoText);
        inputToShow.className = 'edit';
        inputToHide.className = '';
      });
      inputToShow.addEventListener('keyup', function(event) {
        if (event.keyCode === ENTER_KEY) {
          let todoText = inputToShow.value;
          that.changeTodo(parentLiPosition, todoText);
          inputToShow.className = 'edit';
          inputToHide.className = '';
        } else if (event.keyCode === ESCAPE_KEY) {
          inputToShow.value = originalValue;
          that.displayTodos();
        }
      });
    }
  },
  toggleAll: function() {
    todoList.toggleAll();
    view.displayTodos();
  },
  clearCompletedTodos: function() {
    todoList.deleteCompletedTodos();
    todoList.filter = 'all';
    view.displayTodos();
  },
  //TODO: don't like it. To make it simpler
  setFilter: function(filter) {
    todoList.filter = filter || 'all';
    let filterHandlers = document.getElementById('filters').children;
    for (let i = 0; i < filterHandlers.length; i++) {
      let aChild = filterHandlers[i].children;
      let aChildHref = aChild[0].getAttribute('href');
      if (aChildHref.search(filter) > 0) {
        aChild[0].className = 'selected';
      }
      view.displayTodos();
    }
  }
};

var view = {
  displayTodos: function() {
    let todosUl = document.getElementById('todoNotebook');
    let filteredTodo = todoList.getFilteredTodos();
    todosUl.innerHTML = '';
    filteredTodo.forEach(function(todo, position) {
      let todosDiv = document.createElement('div');
      let todosLi = document.createElement('li');
      let todosInput = document.createElement('input');
      let todosInputLabel = document.createElement('label');
      let todosInputEdit = document.createElement('input');
      let todoFooter = document.getElementById('footer');
      let todoTextWithCompletion = '';

      // if completed add '(x)' else '()'
      if (todo.completed === true) {
        todosInput.checked = true;
        todoTextWithCompletion = todo.todoText;
      } else {
        todosInput.checked = false;
        todoTextWithCompletion = todo.todoText;
      }
    //Next doesn't fit with UUID
    //Maybe better to give li the uuid as id and then use data attribute for input and label    
      todosLi.id = todo.uuid;
      todosDiv.className = 'todoContainer';
      todosInput.type = 'checkbox';
      todosInput.data = todo.uuid;
      todosInputLabel.textContent = todoTextWithCompletion;
      todosInputEdit.value = todoTextWithCompletion;
      todosInputEdit.className = 'edit';
      todosInputEdit.type = 'text';
      todosUl.appendChild(todosLi);
      todosLi.appendChild(todosDiv);
      todosDiv.appendChild(todosInput);
      todosDiv.appendChild(todosInputLabel);
      todosDiv.appendChild(todosInputEdit);
      todosLi.appendChild(this.createDeleteButton());

      todoFooter.className = 'active';
      todoFooter.firstChild.textContent = todoList.countActiveTodo() + ' left';
    }, this);
  },
  createDeleteButton: function() {
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'deleteButton';
    return deleteButton;
  },
  setUpEventListeners: function() {
    let todoNotebook = document.getElementById('todoNotebook');
    let addTodoTextInput = document.getElementById('addTodoTextInput');
    let todosFilter = document.getElementById('filters');
    let clearCompletedBtn = document.getElementById('clearCompletedBtn');

    addTodoTextInput.addEventListener('keyup', function(event) {
      handlers.addTodo(event);
    });
    todoNotebook.addEventListener('change', function(event) {
      handlers.toggleCompleted(event);
    });
    todoNotebook.addEventListener('dblclick', function(event) {
      handlers.editTodo(event);
    });
    todoNotebook.addEventListener('click', function(event) {
      let elementClicked = event.target;
      if (elementClicked.className === 'deleteButton') {
        //handlers.deleteTodo()
        handlers.deleteTodo(elementClicked.parentNode.id);
      }
    });
    window.addEventListener('hashchange', function() {
      this.conveyCurrentFilter();
    }.bind(this));
    window.onload = function() {
      this.conveyCurrentFilter();
    }.bind(this);
    clearCompletedBtn.addEventListener('click', function() {
      handlers.clearCompletedTodos();
    });
  },
  conveyCurrentFilter: function() {
    let currentFilter = window.location.hash.slice(1) || 'all' ;
    handlers.setFilter(currentFilter);
  }
};

view.setUpEventListeners();
