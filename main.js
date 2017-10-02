// jscs:disable maximumLineLength
// jshint esversion: 6

//Object that contains all TODO function.
const ENTER_KEY = 13;
const ESCAPE_KEY = 27;
const inputIdFilter = /todo[0-9]*/g;

var todoList = {
  todos: [],
  filter: 'all',
  addTodo: function(todoText) {
      this.todos.push({
          todoText: todoText,
          completed: false
        });
    },
  changeTodo: function(position, todoText) {
      this.todos[position].todoText = todoText;
    },
  deleteTodo: function(position) {
      this.todos.splice(position, 1);
    },
  toggleCompleted: function(position) {
      let todo = this.todos[position];
      todo.completed = !todo.completed;
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
};

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
  deleteTodo: function(position) {
    todoList.deleteTodo(position);
    view.displayTodos();
  },
  toggleCompleted: function(event) {
    let targetId = event.target.id;
    if (targetId.match(inputIdFilter)) {
      let parentLiPosition = event.target.parentNode.parentNode.id;
      todoList.toggleCompleted(parentLiPosition);
      view.displayTodos();
    }
  },
  editTodo: function(event) {
    //TODO: event listeners in view module. Sort them out
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
  }
};

var view = {
  displayTodos: function(todos) {
    let todosUl = document.getElementById('todoNotebook');
    let filteredTodo = todoList.getFilteredTodos();
    todosUl.innerHTML = '';
    /* for (var i = 0; i < todoList.todos.length; i++) {
      var todosLi = document.createElement('li');
      var todo = todoList.todos[i];
      var todoTextWithCompletion = '';

      // if completed add '(x)' else '()'
      if (todo.completed === true) {
        todoTextWithCompletion = '(x) ' + todo.todoText;
      } else {
        todoTextWithCompletion = '( ) ' + todo.todoText;
      }

      todosLi.id = i;
      todosLi.textContent = todoTextWithCompletion;
      todosLi.appendChild(this.createDeleteButton());
      todosUl.appendChild(todosLi);
    }*/

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

      todosLi.id = position;
      todosDiv.className = 'todoContainer';
      todosInput.type = 'checkbox';
      todosInput.id = 'todo' + position;
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
        handlers.deleteTodo(parseInt(elementClicked.parentNode.id));
      }
    });
    todosFilter.addEventListener('click', function(event) {
      if (event.target.tagName === 'A') {
        let targetHref = event.target.getAttribute('href');
        todoList.filter = targetHref.slice(1);
        view.displayTodos();
      }
    });
  }
};

view.setUpEventListeners();
