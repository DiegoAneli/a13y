/**
 * @a13y/react - DialogStack Pattern
 * Manages nested modals with proper focus restoration and z-index layering
 */

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { AccessibleDialog } from '../components/AccessibleDialog';

/**
 * Dialog in the stack
 */
interface StackedDialog {
  id: string;
  title: string;
  content: ReactNode;
  description?: string;
  onClose: () => void;
  zIndex: number;
}

/**
 * Dialog stack context
 */
interface DialogStackContextValue {
  /**
   * Push a new dialog onto the stack
   */
  push: (dialog: Omit<StackedDialog, 'zIndex'>) => void;

  /**
   * Pop the topmost dialog
   */
  pop: () => void;

  /**
   * Close a specific dialog by ID
   */
  close: (id: string) => void;

  /**
   * Close all dialogs
   */
  closeAll: () => void;

  /**
   * Current stack depth
   */
  depth: number;
}

const DialogStackContext = createContext<DialogStackContextValue | null>(null);

/**
 * Hook to access dialog stack
 */
export const useDialogStack = (): DialogStackContextValue => {
  const context = useContext(DialogStackContext);
  if (!context) {
    throw new Error('useDialogStack must be used within DialogStackProvider');
  }
  return context;
};

/**
 * Props for DialogStackProvider
 */
export interface DialogStackProviderProps {
  children: ReactNode;
  /**
   * Base z-index for dialogs
   * @default 1000
   */
  baseZIndex?: number;
  /**
   * Z-index increment between layers
   * @default 10
   */
  zIndexIncrement?: number;
}

/**
 * Dialog Stack Provider
 *
 * Manages a stack of nested dialogs with:
 * - Automatic z-index management
 * - Focus restoration chain
 * - Escape key closes topmost dialog only
 * - Backdrop isolation per layer
 *
 * Pattern Explanation:
 * - Each dialog gets a unique z-index: base + (depth * increment)
 * - Focus is trapped in the topmost dialog
 * - When a dialog closes, focus returns to the previous dialog
 * - Escape key only affects the topmost dialog
 * - Body scroll is locked when any dialog is open
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <DialogStackProvider>
 *       <MyComponent />
 *     </DialogStackProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const { push, pop } = useDialogStack();
 *
 *   return (
 *     <button onClick={() => push({
 *       id: 'dialog1',
 *       title: 'First Dialog',
 *       content: <SecondLevelDialog />,
 *       onClose: () => pop(),
 *     })}>
 *       Open Dialog
 *     </button>
 *   );
 * }
 *
 * function SecondLevelDialog() {
 *   const { push, pop } = useDialogStack();
 *
 *   return (
 *     <button onClick={() => push({
 *       id: 'dialog2',
 *       title: 'Nested Dialog',
 *       content: <p>This is nested!</p>,
 *       onClose: () => pop(),
 *     })}>
 *       Open Nested Dialog
 *     </button>
 *   );
 * }
 * ```
 */
export const DialogStackProvider = (props: DialogStackProviderProps) => {
  const { children, baseZIndex = 1000, zIndexIncrement = 10 } = props;

  const [stack, setStack] = useState<StackedDialog[]>([]);

  const push = (dialog: Omit<StackedDialog, 'zIndex'>) => {
    const zIndex = baseZIndex + stack.length * zIndexIncrement;
    setStack((prev) => [...prev, { ...dialog, zIndex }]);
  };

  const pop = () => {
    setStack((prev) => {
      const newStack = [...prev];
      const dialog = newStack.pop();
      dialog?.onClose();
      return newStack;
    });
  };

  const close = (id: string) => {
    setStack((prev) => {
      const index = prev.findIndex((d) => d.id === id);
      if (index === -1) return prev;

      // Close this dialog and all dialogs above it
      const closedDialogs = prev.slice(index);
      for (const d of closedDialogs) {
        d.onClose();
      }

      return prev.slice(0, index);
    });
  };

  const closeAll = () => {
    for (const d of stack) {
      d.onClose();
    }
    setStack([]);
  };

  // Body scroll lock when stack is not empty
  useEffect(() => {
    if (stack.length > 0) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [stack.length]);

  const contextValue: DialogStackContextValue = {
    push,
    pop,
    close,
    closeAll,
    depth: stack.length,
  };

  return (
    <DialogStackContext.Provider value={contextValue}>
      {children}

      {/* Render all dialogs in the stack */}
      {stack.map((dialog) => (
        <div key={dialog.id} style={{ zIndex: dialog.zIndex }}>
          <AccessibleDialog
            isOpen={true}
            onClose={() => close(dialog.id)}
            title={dialog.title}
            description={dialog.description}
            backdropClassName="dialog-stack-backdrop"
          >
            {dialog.content}
          </AccessibleDialog>
        </div>
      ))}
    </DialogStackContext.Provider>
  );
};
