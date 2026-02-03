import React, { useState, useRef, useEffect } from 'react';
import { Todo } from '../types/Todo';

export const TodoItem: React.FC<{
  todo: Todo;
  onDelete?: () => void;
  onToggle?: () => void;
  onRename?: (title: string) => Promise<void>;
  isProcessing?: boolean;
}> = ({ todo, onDelete, onToggle, onRename, isProcessing }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(todo.title);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const finishEdit = () => {
    const trimmed = newTitle.trim();

    if (!trimmed) {
      onDelete?.();

      return;
    }

    if (trimmed !== todo.title) {
      if (onRename) {
        onRename(trimmed)
          .then(() => {
            setIsEditing(false);
            setError(false);
          })
          .catch(() => setError(true));
      }
    } else {
      setIsEditing(false);
    }
  };

  const inputId = `todo-${todo.id}`;

  return (
    <div data-cy="Todo" className={`todo ${todo.completed ? 'completed' : ''}`}>
      <label htmlFor={inputId} className="todo__status-label">
        <input
          id={inputId}
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={onToggle}
          disabled={isProcessing}
        />
        <span className="todo__status-custom" aria-hidden="true" />
      </label>

      {!isEditing ? (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.title}
          </span>
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={onDelete}
            disabled={isProcessing}
          >
            ×
          </button>
        </>
      ) : (
        <input
          ref={inputRef}
          data-cy="TodoTitleField"
          className={`todo__title-field ${error ? 'is-error' : ''}`}
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onBlur={finishEdit}
          onKeyUp={e => {
            if (e.key === 'Enter') {
              finishEdit();
            }

            if (e.key === 'Escape') {
              setIsEditing(false);
              setNewTitle(todo.title);
              setError(false);
            }
          }}
        />
      )}

      <div
        data-cy="TodoLoader"
        className={`modal overlay ${isProcessing ? 'is-active' : ''}`}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
