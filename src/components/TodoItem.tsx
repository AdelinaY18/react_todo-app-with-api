import React, { useState, useRef, useEffect } from 'react';
import cn from 'classnames';
import { Todo } from '../types/Todo';

export const TodoItem: React.FC<{
  todo: Todo;
  onDelete?: () => void;
  onToggle?: () => void;
  onRename?: (title: string) => Promise<void>;
  isProcessing?: boolean;
}> = ({ todo, onDelete, onToggle, onRename, isProcessing }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(todo.title);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const finishEdit = async () => {
    const trimmed = value.trim();

    if (!trimmed) {
      onDelete?.();

      return;
    }

    if (trimmed === todo.title) {
      setIsEditing(false);

      return;
    }

    try {
      await onRename?.(trimmed);
      setIsEditing(false);
    } catch {}
  };

  return (
    <div data-cy="Todo" className={cn('todo', { completed: todo.completed })}>
      <label className="todo__status-label">
        <input
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          disabled={isProcessing}
          onChange={onToggle}
        />
        <span className="is-sr-only">Mark todo as completed</span>
      </label>
      {!isEditing ? (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => {
              setValue(todo.title);
              setIsEditing(true);
            }}
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
          className="todo__title-field"
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={finishEdit}
          onKeyUp={e => {
            if (e.key === 'Enter') {
              finishEdit();
            }

            if (e.key === 'Escape') {
              setIsEditing(false);
            }
          }}
        />
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', { 'is-active': isProcessing })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
