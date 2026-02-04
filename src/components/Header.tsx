import React from 'react';
import { NewTodoForm } from './NewTodoForm';
import { ErrorMessage } from '../App';
import { Todo } from '../types/Todo';

type Props = {
  todos: Todo[];
  title: string;
  setTitle: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  tempTodo: Todo | null;
  inputRef: React.RefObject<HTMLInputElement>;
  error: ErrorMessage;
  setError: React.Dispatch<React.SetStateAction<ErrorMessage>>;
  onToggleAll: () => void;
};

export const Header: React.FC<Props> = ({
  todos,
  title,
  setTitle,
  onSubmit,
  tempTodo,
  inputRef,
  error,
  setError,
  onToggleAll,
}) => {
  return (
    <header className="todoapp__header">
      {todos.length > 0 && (
        <button
          type="button"
          className={`todoapp__toggle-all ${
            todos.every(todo => todo.completed) ? 'active' : ''
          }`}
          data-cy="ToggleAllButton"
          onClick={onToggleAll}
        />
      )}

      <NewTodoForm
        title={title}
        setTitle={setTitle}
        onSubmit={onSubmit}
        disabled={!!tempTodo}
        inputRef={inputRef}
        error={error}
        setError={setError}
      />
    </header>
  );
};
