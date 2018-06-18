
import _ from 'lodash';
import hash from 'string-hash';

const db = firebase.database();
const todosElem = document.querySelector('.js-todos');

function createHash() {
  const str = '1234567890ABCDEFGCHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return hash(str+Date.now());
}

async function observeTodo() {
  const todos = db.ref().child('todos');
  const promise = new Promise((resolve) => {
    todos.on('value', async (snapshot) => {
      const lists = [];
      _.forEach(snapshot.val(), ({ title }, key) => {
        lists.push({ key, title });
      });
      await showAllTodos(lists);
      resolve();
    });
  });
  return promise;
}

async function addTodo({ title, completed, date }) {
  const addTodo = db.ref(`todos/${createHash()}`);
  completed = completed != null ? completed : false;
  date = date != null ? date : Date.now();

  async function setTodo() {
    return new Promise((resolve, reject) => {
      addTodo.set({
        title,
        completed,
        date,
      }, (error) => {
        if (error != null) {
          reject();
          return;
        }
        resolve();
      });
    });
  }

  return await setTodo().catch((e) => console.error(e));
}

function deleteTodo(key) {
  const todo = db.ref(`todos/${key}`);
  todo.remove();
}

async function showAllTodos(todos) {
  while (todosElem.firstChild) {
    todosElem.removeChild(todosElem.firstChild);
  }
  const frag = document.createDocumentFragment();
  _.forEach(todos, ({ key, title }) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('todo');
    // title
    const titleElem = document.createElement('p');
    titleElem.textContent = title;
    wrapper.appendChild(titleElem);
    // delete button
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button'
    deleteButton.textContent = 'delete';
    deleteButton.classList.add('todo__delete');
    deleteButton.addEventListener('click', () => {
      deleteTodo(key);
    });
    wrapper.appendChild(deleteButton);
    frag.appendChild(wrapper);
  });
  todosElem.appendChild(frag);
}

async function main() {
  // show todos
  await observeTodo();

  // register elems
  const titleInput = document.querySelector('.js-register-todo-title');
  const submitButton = document.querySelector('.js-register-todo-submit');
  submitButton.addEventListener('click', async () => {
    const title = titleInput.value;
    if (title == '') {
      return;
    }
    await addTodo({ title });
  });
}

main();


