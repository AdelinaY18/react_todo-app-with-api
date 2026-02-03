/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  getTodos,
  createTodo,
  deleteTodo as deleteTodoRequest,
  updateTodo,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';
import { NewTodoForm } from './components/NewTodoForm';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { ErrorNotification } from './components/ErrorNotification';
import { Filter } from './types/Filter';

export enum ErrorMessage {
  None = '',
  Load = 'Unable to load todos',
  Add = 'Unable to add a todo',
  Delete = 'Unable to delete a todo',
  Update = 'Unable to update a todo',
  Empty = 'Title should not be empty',
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [error, setError] = useState<ErrorMessage>(ErrorMessage.None);
  const [filter, setFilter] = useState<Filter>(Filter.All);
  const [title, setTitle] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!USER_ID) {
      return;
    }

    getTodos()
      .then(setTodos)
      .catch(() => setError(ErrorMessage.Load));
  }, []);

  useEffect(() => {
    if (!tempTodo && processingIds.length === 0) {
      inputRef.current?.focus();
    }
  }, [tempTodo, processingIds]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const visibleTodos = todos.filter(todo => {
    if (filter === Filter.Active) {
      return !todo.completed;
    }

    if (filter === Filter.Completed) {
      return todo.completed;
    }

    return true;
  });

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError(ErrorMessage.Empty);

      return;
    }

    const newTodo: Todo = {
      id: Date.now(),
      title: trimmed,
      completed: false,
      userId: USER_ID,
    };

    setTempTodo(newTodo);

    createTodo(newTodo)
      .then(todoFromServer => {
        setTodos(prev => [...prev, todoFromServer]);
        setTitle('');
        setTempTodo(null);
      })
      .catch(() => {
        setError(ErrorMessage.Add);
        setTempTodo(null);
      });
  };

  const handleDelete = (id: number) => {
    setProcessingIds(ids => [...ids, id]);
    deleteTodoRequest(id)
      .then(() => setTodos(prev => prev.filter(t => t.id !== id)))
      .catch(() => setError(ErrorMessage.Delete))
      .finally(() => setProcessingIds(ids => ids.filter(i => i !== id)));
  };

  const handleToggle = (todo: Todo) => {
    setProcessingIds(ids => [...ids, todo.id]);
    updateTodo({ ...todo, completed: !todo.completed })
      .then(updated =>
        setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t))),
      )
      .catch(() => setError(ErrorMessage.Update))
      .finally(() => setProcessingIds(ids => ids.filter(i => i !== todo.id)));
  };

  const handleRename = (todo: Todo, newTitle: string) => {
    setProcessingIds(ids => [...ids, todo.id]);

    return updateTodo({ ...todo, title: newTitle })
      .then(updated =>
        setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t))),
      )
      .catch(err => {
        setError(ErrorMessage.Update);
        throw err;
      })
      .finally(() => setProcessingIds(ids => ids.filter(i => i !== todo.id)));
  };

  const handleToggleAll = () => {
    const allCompleted = todos.every(t => t.completed);

    todos.forEach(t => {
      if (t.completed === allCompleted) {
        handleToggle(t);
      }
    });
  };

  const handleClearCompleted = () => {
    todos.filter(t => t.completed).forEach(t => handleDelete(t.id));
  };

  const activeCount = todos.filter(t => !t.completed).length;
  const hasCompleted = todos.some(t => t.completed);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {todos.length > 0 && (
            <button
              type="button"
              className={`todoapp__toggle-all ${todos.every(t => t.completed) ? 'active' : ''}`}
              data-cy="ToggleAllButton"
              onClick={handleToggleAll}
            />
          )}

          <NewTodoForm
            title={title}
            setTitle={setTitle}
            onSubmit={handleAddTodo}
            disabled={!!tempTodo}
            inputRef={inputRef}
            error={error}
            setError={setError}
          />
        </header>

        {visibleTodos.length > 0 || tempTodo ? (
          <TodoList
            todos={visibleTodos}
            tempTodo={tempTodo}
            processingIds={processingIds}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onRename={handleRename}
          />
        ) : null}

        {todos.length > 0 && (
          <Footer
            activeCount={activeCount}
            todos={todos}
            hasCompletedTodos={hasCompleted}
            onClearCompleted={handleClearCompleted}
            filter={filter}
            setFilter={setFilter}
          />
        )}
      </div>

      <ErrorNotification
        error={error}
        onClose={() => setError(ErrorMessage.None)}
      />
    </div>
  );
};
