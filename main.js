// jscs:disable maximumLineLength

//Object that contains all TODO function

var todoList = {
  todos: [],
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
      var todo = this.todos[position];
      todo.completed = !todo.completed;
    },
  toggleAll: function() {
    var totalTodos = this.todos.length;
    var completedTodos = 0;

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
  }
};

//TODO: Select button to Display Todos
var handlers = {
  addTodo: function() {
    var addTodoTextInpunt = document.getElementById('addTodoTextInput');
    todoList.addTodo(addTodoTextInpunt.value);
    addTodoTextInpunt.value = '';
    view.displayTodos();
  },
  changeTodo: function(position) {
    todoList.changeTodo(position);
    view.displayTodos();
  },
  deleteTodo: function(position) {
    todoList.deleteTodo(position);
    view.displayTodos();
  },
  toggleCompleted: function() {
    var toggleCompletedInput = document.getElementById('toggleCompletedInput');
    todoList.toggleCompleted(toggleCompletedInput.value);
    toggleCompletedInput.value = '';
    view.displayTodos();
  },
  toggleAll: function() {
    todoList.toggleAll();
    view.displayTodos();
  }
};

var view = {
  displayTodos: function() {
    var todosUl = document.querySelector('ul');
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
    todoList.todos.forEach(function(todo, position) {
      var todosLi = document.createElement('li');
      var todoTextWithCompletion = '';

      // if completed add '(x)' else '()'
      if (todo.completed === true) {
        todoTextWithCompletion = '(x) ' + todo.todoText;
      } else {
        todoTextWithCompletion = '( ) ' + todo.todoText;
      }

      todosLi.id = position;
      todosLi.textContent = todoTextWithCompletion;
      todosLi.appendChild(this.createDeleteButton());
      todosUl.appendChild(todosLi);
    }, this);
  },
  createDeleteButton: function() {
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'deleteButton';
    return deleteButton;
  },
  setUpEventListeners: function() {
    var todosUl = document.querySelector('ul');
    todosUl.addEventListener('click', function(event) {
      var elementClicked = event.target;
      if (elementClicked.className === 'deleteButton') {
        //handlers.deleteTodo()
        handlers.deleteTodo(parseInt(elementClicked.parentNode.id));
      }
    });
  }
};

view.setUpEventListeners();
