// jscs:disable maximumLineLength
// jshint esversion: 6
/* global document */
/* global window */
/* global localStorage */
const todoApp = (function() {
  'use strict';

  const ENTER_KEY = 13;
  const ESCAPE_KEY = 27;

  const todoList = (function() {
    let todos = [];
    // let filter;

    const addTodo = (todoText) => {
      todos.push({
        todoText: todoText,
        completed: false,
        uuid: util.createUUID()
      });
    };
    const changeTodo = (uuid, todoText) => {
      todos.map(function(todo) {
        if (todo.uuid === uuid) {
          todo.todoText = todoText;
        }
      });
    };
    const deleteTodo = (uuid) => {
      todos.forEach(function(todo, i) {
        if (todo.uuid === uuid) {
          todos.splice(i, 1);
        }
      });
    };
    const toggleCompleted = (uuid) => {
      todos.forEach(function(todo, i) {
        if (todo.uuid === uuid) {
          todo.completed = !todo.completed;
        }
      });
    };
    // const toggleAll = () => {
    //   let totalTodos = todos.length;
    //   let completedTodos = 0;
    //   todos.forEach(function(todo) {
    //     if (todo.completed === true) {
    //       completedTodos++;
    //     }
    //   });
    //   todos.forEach(function(todo) {
    //     if (completedTodos === totalTodos) {
    //       todo.completed = false;
    //     } else {
    //       todo.completed = true;
    //     }
    //   });
    // };
    const countActiveTodo = () => {
      let count = 0;
      todos.forEach(function(todo) {
        if (!todo.completed) {
          count++;
        }
      });
      return count;
    };
    const getFilteredTodos = () => {
      switch (todoList.filter) {
        case 'all':
          return todos;
        case 'active':
          return todos.filter(function(todo) {
            return !todo.completed;
          });
        case 'completed':
          return todos.filter(function(todo) {
            return todo.completed;
          });
      }
    };
    const deleteCompletedTodos = () => {
      todos = todos.filter(function(todo) {
        return !todo.completed;
      });
    };
    const setFilter = (filter) => {
      todoList.filter = filter || 'all';
    };
    const toggleAll = (bool) => {
      todos.forEach(function(todo) {
        todo.completed = bool;
      });
    };
    const store = function(namespace, data) {
      if (arguments.length > 1) {
        localStorage.setItem(namespace, JSON.stringify(data));
      } else {
        let storedData = localStorage.getItem(namespace);
        todos = JSON.parse(storedData) || [];
      }
    };
    return {
      todos: () => todos,
      filter: 'all',
      addTodo: addTodo,
      changeTodo: changeTodo,
      deleteTodo: deleteTodo,
      toggleCompleted: toggleCompleted,
      toggleAll: toggleAll,
      countActiveTodo: countActiveTodo,
      getFilteredTodos: getFilteredTodos,
      deleteCompletedTodos: deleteCompletedTodos,
      setFilter: setFilter,
      store: store
    };
  })();

  const util = {
    createUUID: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0;
        let v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    // store: function(namespace, data) {
    //   if (arguments.length > 1) {
    //     localStorage.setItem(namespace, JSON.stringify(data));
    //   } else {
    //     let storedData = localStorage.getItem(namespace);
    //     todoList.todos = JSON.parse(storedData) || [];
    //   }
    // }
  };

  const handlers = (function() {
    const addTodo = (event) => {
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
    };
    const changeTodo = (uuid, todoText) => {
      todoList.changeTodo(uuid, todoText);
      view.displayTodos();
    };
    const deleteTodo = (uuid) => {
      todoList.deleteTodo(uuid);
      view.displayTodos();
    };
    const toggleCompleted = (uuid) => {
      todoList.toggleCompleted(uuid);
      view.displayTodos();
    };
    const getTodoElements = (el) => {
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
    };

    //TODO: move to view
    const editingMode = (el) => {
      let elements = getTodoElements(el);
      elements.label.className = 'edit';
      elements.editInput.className = 'editing';
      elements.editInput.focus();
      elements.editInput.select();
    };
    const editTodo = (e) => {
      let editInput = e.target;
      let type = e.type;
      let todoText = e.target.value;
      let todoUUID = editInput.parentNode.id;
      let originalValue = this.getTodoElements(e.target).label.textContent;
      if (type === 'blur' || e.keyCode == ENTER_KEY) {
        changeTodo(todoUUID, todoText);
        view.displayTodos();
        editInput.className = 'edit';
      } else if (e.keyCode == ESCAPE_KEY) {
        editInput.value = originalValue;
        view.displayTodos();
      }
    };
    const toggleAll = (e) => {
      let isChecked = e.target.checked;
      todoList.toggleAll(isChecked);
      view.displayTodos();
    };
    const clearCompletedTodos = () => {
      todoList.deleteCompletedTodos();
      todoList.filter = 'all';
      view.displayTodos();
    };
    const setFilter = (filter) => {
      todoList.setFilter(filter);
      //TODO: move to view
      let filterParent = document.getElementById('filters');
      let filters = filterParent.querySelectorAll('A');
      filters.forEach(function(a) {
        let href = a.getAttribute('href');
        a.className = href.search(filter) > 0 ? 'selected' : '';
      });
      view.displayTodos();
    };
    return {
      addTodo: addTodo,
      toggleCompleted: toggleCompleted,
      editingMode: editingMode,
      editTodo: editTodo,
      deleteTodo: deleteTodo,
      toggleAll: toggleAll,
      clearCompletedTodos: clearCompletedTodos,
      setFilter: setFilter,
    };
  })();

  const view = (function() {
    //TODO: refactor with querySelector
    let todos = todoList.todos;

    const init = () => {
      todoList.store('todo-app');
      displayTodos();
      conveyCurrentFilter();
      setUpEventListeners();
    };
    const buildTodoUI = () => {
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
    };
    const renderTodo = (todo, ui) => {
      let template = new ui.todoTemplate();
      let todoTextWithCompletion = '';
      if (todo.completed === true) {
        template.todosCheckbox.checked = true;
        todoTextWithCompletion = todo.todoText;
      } else {
        template.todosCheckbox.checked = false;
        todoTextWithCompletion = todo.todoText;
      }
      //TODO: refactor to many repetitions
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
    };
    const displayTodos = () => {
      let ui = buildTodoUI();
      let filteredTodo = todoList.getFilteredTodos();
      ui.todosUl.className = todos().length > 0 ? 'active' : 'hidden';
      filteredTodo.forEach(function(todo) {
        renderTodo(todo, ui);
      });
      renderFooter(ui);
      todoList.store('todo-app', todos());
    };
    const renderFooter = (ui) => {
      let activeTodoCount = todoList.countActiveTodo();
      if (todos().length > 0) {

        //TODO: move where it fits -- below does not fit with footer
        if ((todos().length - activeTodoCount) === todos().length) {
          ui.toggleAllInput.checked = true;
        } else {
          ui.toggleAllInput.checked = false;
        }
        ui.clearCompletedBtn.style.visibility = activeTodoCount !== todos().length ? 'visible' : 'hidden';
        ui.todoFooter.className = 'active';
        ui.todoCountSpan.textContent = activeTodoCount + ' left';
      } else {
        ui.todoFooter.className = 'hidden';
      }
    };
    const setUpEventListeners = () => {
      //TODO: replace with buildTodoUI function
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
        conveyCurrentFilter();
      });
      clearCompletedBtn.addEventListener('click', function() {
        handlers.clearCompletedTodos();
      });
    };
    const conveyCurrentFilter = () => {
      let currentFilter = window.location.hash.slice(1) || 'all' ;
      handlers.setFilter(currentFilter);
    };
    return {
      displayTodos: displayTodos,
      init: init
    };

  })();
  // view.init();
  return {
    init: view.init
  };
})();

const switcher = (function() {
  const playGround = document.getElementById('playGround');
  const getHtml = (app) => {
    app = app === 'todo' ? 'todo-app.html' : 'note-app.html';
    let xhr = new XMLHttpRequest();
    xhr.open('GET', app, true);
    //TEMP
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    //
    xhr.onreadystatechange = function() {
      if (this.readyState !== 4) { return; }
      if (this.status !== 200) { return; }// or whatever error handling you want
      playGround.innerHTML = this.responseText;
    };
    return xhr;
  };
  const renderTodoApp = () => {
    let xhr = getHtml('todo');
    xhr.onload = () => {
      todoApp.init();
    };
    xhr.send();
  };
  const renderNoteApp = () => {
    let xhr = getHtml('note');
    // let notejs = loadJsCss('js/quill.min.js', 'js');
    // loadJsCss('css/quill.snow.css', 'css');
    // loadJsCss('js/quill.min.js', 'js');
    xhr.onload = () => {
      noteApp.init();
    };
    xhr.send();
  };
  const reset = () => {
    playGround.innerHTML = '';
  };
  return {
    renderTodoApp: renderTodoApp,
    renderNoteApp: renderNoteApp,
    reset: reset
  };
})();
// switcher.renderTodoApp();

const noteApp = (function() {
  let quill;

  const notes = (function() {
    //
    const saveNote = () => {
      let delta = quill.getContents();
      localStorage.setItem('note-app', JSON.stringify(delta));
    };
    const loadNote = () => {
      let delta = JSON.parse(localStorage.getItem('note-app'));
      quill.setContents(delta);
    };

    //END NOTES MODULE
    return {
      saveNote: saveNote,
      loadNote: loadNote
    };
  })();

  const handlers = (function() {
    const init = () => {
      let noteJs = util.loadJsCss('js/quill.core.js', 'js');
      let noteCss = util.loadJsCss('css/quill.core.css', 'css');
      noteJs.onload = function() {
        editor(); //TODO: editors needs to be a module. Here it should call editor.init()

        //TODO: the following goes in editor.init()
        quill = new Quill('#editor', {
          modules: {
            xtoolbar: {
                container: '#tooltip-controls',
                sidebar: '#sidebar-controls'
              }
          }
          // theme: 'snow'
        });
        quill.addContainer(document.querySelector('#linkTooltip')); //Need really to move to editor module!!!
        notes.loadNote();
      };
      view.setUpEventListeners();
    };
    const saveNote = () => {
      //Defines delta quill to save via notes module
      //triggers on quill.ontextchange event listener via view
    };

    //END HANDLERS MODULE
    return {
      init: init,
    };
  })();

  const view = (function() {
    const setUpEventListeners = () => {
      document.getElementById('saveNote').addEventListener('click', notes.saveNote);
    };

    const editingMode = () => {
      //show toolbar and allow edit
    };
    const readOnlyMode = () => {
      //hides toolbars and disables editing
    };
    //END VIEW MODULE
    return {
      setUpEventListeners: setUpEventListeners
    };
  })();

  const util = (function() {
    const loadJsCss = (filename, filetype) => {
      let section = document.getElementById('noteAppPlayGround');
      if (filetype === 'js') { //if filename is a external JavaScript file
        let fileref = document.createElement('script');
        fileref.setAttribute('type', 'text/javascript');
        fileref.setAttribute('src', filename);
        section.appendChild(fileref);
        return fileref;
      } else if (filetype === 'css') { //if filename is an external CSS file
        var fileref = document.createElement('link');
        fileref.setAttribute('rel', 'stylesheet');
        fileref.setAttribute('type', 'text/css');
        fileref.setAttribute('href', filename);
        section.insertBefore(fileref, section.firstChild);
      }
    };
    return {
      loadJsCss: loadJsCss
    };
  })();

  const editor = () => {
    // Register toolbar module
    Quill.register('modules/xtoolbar', function(quill, options) {
      let container = document.querySelector(options.container);
      let mediaControls = document.querySelector(options.sidebar);
      let formatButtons = container.querySelectorAll('button');
      let mediaButtons = mediaControls.querySelectorAll('button');
      formatButtons.forEach(function(btn, i) {
        let formatToApply = btn.className.substring(4);
        let format = quill.getFormat();
        //make it a setUpToolTipListener()
        //button need to be toggle for undoing the format
        //TODO: fix code so can iterate getFormat() object so to assign correct status to button
        // for a given selection
        btn.addEventListener('click', function(e) {
          if (formatToApply === 'header') {
            let h = e.target.parentNode.id.substring(7, 8);
            quill.format('header', h);
          } else if (formatToApply !== 'link') {
            quill.format(formatToApply, !format[formatToApply]);
            // quill.format(formatToApply, url);
            // quill.format('link', 'url');
          } else {
            displayLinkTooltip();
          }
        });
      });
      const displayLinkTooltip = () => {
        let linkTooltip = document.querySelector('#linkTooltip');
        let linkBtn = document.querySelector('#linkTooltip button');
        let rangeBounds = quill.getBounds(quill.getSelection());

        linkTooltip.className = 'visible';
        console.log(rangeBounds); //TEST
        //change 140 if you change div width
        linkTooltip.style.left = (rangeBounds.left + rangeBounds.width / 2 - 140) + 'px';
        linkTooltip.style.top = (rangeBounds.top + rangeBounds.height + 5) + 'px';
        linkBtn.onclick = () => {
          let url = document.querySelector('#linkTooltip input').value;
          if (url) {
            formatLink(url);
          }
          linkTooltip.className = 'hidden';
        };
      };
      const formatLink = (url) => {
        quill.format('link', url);
      };
      //TEST
      quill.on('selection-change', function(range, oldRange, source) {
    if (range) {
      if (range.length == 0) {
        console.log('User cursor is on', range.index);
      } else {
        let rangeBounds = quill.getBounds(range);
        var text = quill.getText(range.index, range.length);
        // console.log('User has highlighted', text, source);
        // console.log(rangeBounds);
        // console.log(range);
      }
    } else {
      console.log('Cursor not in the editor');
    }
  });
    });

    //Register Formatting
    let Inline = Quill.import('blots/inline');
    let Block = Quill.import('blots/block');

    class BoldBlot extends Inline { }
    BoldBlot.blotName = 'bold';
    BoldBlot.tagName = 'strong';

    class ItalicBlot extends Inline { }
    ItalicBlot.blotName = 'italic';
    ItalicBlot.tagName = 'em';

    class LinkBlot extends Inline {
      static create(url) {
        let node = super.create();
        // Sanitize url value if desired
        node.setAttribute('href', url);
        node.setAttribute('target', '_blank');
        return node;
      }

      static formats(node) {
        return node.getAttribute('href');
      }
    }
    LinkBlot.blotName = 'link';
    LinkBlot.tagName = 'a';

    class BlockquoteBlot extends Block { }
    BlockquoteBlot.blotName = 'blockquote';
    BlockquoteBlot.tagName = 'blockquote';

    class HeaderBlot extends Block {
      static formats(node) {
        return HeaderBlot.tagName.indexOf(node.tagName) + 1;
      }
    }

    HeaderBlot.blotName = 'header';
    HeaderBlot.tagName = ['H1', 'H2'];

    Quill.register(BlockquoteBlot);
    Quill.register(HeaderBlot);
    Quill.register(LinkBlot);
    Quill.register(BoldBlot);
    Quill.register(ItalicBlot);

  };
  //END NOTEAPP IIFE
  return {
    init: handlers.init,
    quill: quill
  };
})();
