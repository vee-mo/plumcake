// jscs:disable maximumLineLength
// jshint esversion: 6
/* global document */
/* global window */
/* global localStorage */
(function() {
'use strict';

//Object that contains all TODO function.
const ENTER_KEY = 13;
const ESCAPE_KEY = 27;
//const UUID_FILTER = /[0-9a-z]{4,12}-{0,1}/ig;

let todoList = {
  todos: [],
  filter: 'all',
  addTodo: function(todoText) {
      this.todos.push({
          todoText: todoText,
          completed: false,
          uuid: util.createUUID()
        });
    },
  changeTodo: function(uuid, todoText) {
      this.todos.map(function(todo) {
        if (todo.uuid === uuid) {
          todo.todoText = todoText;
        }
      });
    },
  deleteTodo: function(uuid) {
      this.todos.forEach(function(todo, i) {
          if (todo.uuid === uuid) {
            this.todos.splice(i, 1);
          }
        }, this);
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
  deleteCompletedTodos: function() {
    this.todos = this.todos.filter(function(todo) {
      return !todo.completed;
    });
  }
};

let util = {
  createUUID: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random() * 16 | 0;
      let v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  store: function(namespace, data) {
    if (arguments.length > 1) {
      localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      let storedData = localStorage.getItem(namespace);
      todoList.todos = JSON.parse(storedData) || [];
    }
  }
};
//TODO: Select button to Display Todos
let handlers = {
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
  changeTodo: function(uuid, todoText) {
    todoList.changeTodo(uuid, todoText);
    view.displayTodos();
  },
  deleteTodo: function(uuid) {
    todoList.deleteTodo(uuid);
    view.displayTodos();
  },
  toggleCompleted: function(uuid) {
    todoList.toggleCompleted(uuid);
    view.displayTodos();
    // }
  },
  getTodoElements: function(el) {
    let li = el.parentNode;
    if (li.tagName.toUpperCase() === 'LI') {
      let children = el.parentNode.children;
      let names = ['checkbox', 'label', 'editInput', 'delete'];
      let todoElements = {};
      for (let i = 0; i < names.length; i++) {
        todoElements[names[i]] = children[i];
      }
      todoElements.li = li;
      return todoElements;
    }
  },
  editingMode: function(el) {
    let elements = this.getTodoElements(el);
    elements.label.className = 'edit';
    elements.editInput.className = 'editing';
    elements.editInput.focus();
    elements.editInput.select();
  },
  editTodo: function(e) {
    let editInput = e.target;
    let type = e.type;
    let todoText = e.target.value;
    let todoUUID = editInput.parentNode.id;
    let originalValue = this.getTodoElements(e.target).label.textContent;

    if (type === 'blur' || e.keyCode == ENTER_KEY) {
      this.changeTodo(todoUUID, todoText);
      view.displayTodos();
      editInput.className = 'edit';
    } else if (e.keyCode == ESCAPE_KEY) {
      editInput.value = originalValue;
      view.displayTodos();
    }
  },
  toggleAll: function(e) {
    let isChecked = e.target.checked;
    todoList.todos.forEach(function(todo) {
      todo.completed = isChecked;
    });
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

//need to refactor to IIFE
let view = {
  init: function() {
    util.store('todo-app');
    this.displayTodos();
    this.conveyCurrentFilter();
    this.setUpEventListeners();
  },
  buildTodoUI: function() {
    let todosUI = {
      todosUl: document.getElementById('todoNotebook'),
      todosContainer: document.getElementById('todosContainer'),
      todoFooter: document.getElementById('footer'),
      toggleAllInput: document.getElementById('toggleAll'),
      todoCountSpan: document.getElementById('todoCountSpan'),
      clearCompletedBtn: document.getElementById('clearCompletedBtn'),
      todoTemplate: function() {
        let elements = {
          //todosDiv: document.createElement('div'),
          todosLi: document.createElement('li'),
          todosCheckbox: document.createElement('input'),
          todosInputLabel: document.createElement('label'),
          todosInputEdit: document.createElement('input'),
          deleteButton: document.createElement('button')
        };

        //elements.todosDiv.className = 'todoContainer';
        elements.todosCheckbox.type = 'checkbox';
        elements.todosCheckbox.className = 'check';
        elements.todosInputEdit.className = 'edit';
        elements.todosInputEdit.type = 'text';
        elements.todosInputLabel.className = 'todoText';
        elements.deleteButton.textContent = 'x';
        elements.deleteButton.className = 'deleteButton';
        // elements.clearCompletedBtn.style.visibility = 'hidden';
        return elements;
      }
    };
    todosUI.todosUl.innerHTML = '';
    return todosUI;
  },
  renderTodo: function(todo, ui) {
    let template = new ui.todoTemplate();
    let todoTextWithCompletion = '';

    if (todo.completed === true) {
      template.todosCheckbox.checked = true;
      todoTextWithCompletion = todo.todoText;
    } else {
      template.todosCheckbox.checked = false;
      todoTextWithCompletion = todo.todoText;
    }
    //Next doesn't fit with UUID
    //Maybe better to give li the uuid as id and then use data attribute for input and label
    template.todosLi.id = todo.uuid;
    template.todosCheckbox.data = todo.uuid;
    template.todosInputLabel.data = todoTextWithCompletion;
    template.todosInputLabel.textContent = todoTextWithCompletion;
    template.todosInputEdit.value = todoTextWithCompletion;
    ui.todosUl.appendChild(template.todosLi);
    template.todosLi.appendChild(template.todosCheckbox);
    template.todosLi.appendChild(template.todosInputLabel);
    template.todosLi.appendChild(template.todosInputEdit);
    template.todosLi.appendChild(template.deleteButton);
  },
  displayTodos: function() {
    let ui = this.buildTodoUI();
    let filteredTodo = todoList.getFilteredTodos();
    todosContainer.className = todoList.todos.length > 0 ? 'active' : 'hidden';
    filteredTodo.forEach(function(todo) {
      this.renderTodo(todo, ui);
    }, this);
    this.renderFooter(ui);
    util.store('todo-app', todoList.todos);
  },
  renderFooter: function(ui) {
    let activeTodoCount = todoList.countActiveTodo();
    if (todoList.todos.length > 0) {
      //does not fit with footer
      if ((todoList.todos.length - activeTodoCount) === todoList.todos.length) {
        ui.toggleAllInput.checked = true;
      } else {
        ui.toggleAllInput.checked = false;
      }
      ui.clearCompletedBtn.style.visibility = activeTodoCount !== todoList.todos.length ? 'visible' : 'hidden';
      ui.todoFooter.className = 'active';
      ui.todoCountSpan.textContent = activeTodoCount + ' left';
    } else {
      ui.todoFooter.className = 'hidden';
    }
  },
  setUpEventListeners: function() {
    let todoNotebook = document.getElementById('todoNotebook');
    let addTodoTextInput = document.getElementById('addTodoTextInput');
    let todosFilter = document.getElementById('filters');
    let clearCompletedBtn = document.getElementById('clearCompletedBtn');
    let toggleAllInput = document.getElementById('toggleAll');

    addTodoTextInput.addEventListener('keyup', function(event) {
      handlers.addTodo(event);
    });
    todoNotebook.addEventListener('change', function(event) {
      let target = event.target;
      let todoUUID = target.data || '';
      if (target.type === 'checkbox' && todoUUID) {
        handlers.toggleCompleted(todoUUID);
      }
    });
    todoNotebook.addEventListener('dblclick', function(event) {
      if (event.target.className === 'todoText') {
        handlers.editingMode(event.target);
        event.target.nextSibling.addEventListener('blur', function(event) {
          handlers.editTodo(event);
        });
      }
    });
    todoNotebook.addEventListener('click', function(event) {
      let elementClicked = event.target;
      if (elementClicked.className === 'deleteButton') {
        //handlers.deleteTodo()
        handlers.deleteTodo(elementClicked.parentNode.id);
      }
    });
    todoNotebook.addEventListener('keyup', function(event) {
      if (event.target.className === 'editing') {
        handlers.editTodo(event);
      }
    });
    toggleAllInput.addEventListener('change', function(event) {
      handlers.toggleAll(event);
    });
    window.addEventListener('hashchange', function() {
      this.conveyCurrentFilter();
    }.bind(this));
    clearCompletedBtn.addEventListener('click', function() {
      handlers.clearCompletedTodos();
    });
  },
  conveyCurrentFilter: function() {
    let currentFilter = window.location.hash.slice(1) || 'all' ;
    handlers.setFilter(currentFilter);
  }
};
view.init();
})();
