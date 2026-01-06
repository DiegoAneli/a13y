/**
 * AccessibleTreeView Component
 * Accessible tree navigation with keyboard support and ARIA
 */

import React, { useState } from 'react';
import { useId } from '../hooks/use-id';

export interface TreeNode<T = unknown> {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional data payload */
  data?: T;
  /** Child nodes */
  children?: TreeNode<T>[];
  /** Whether node is disabled */
  disabled?: boolean;
}

export interface AccessibleTreeViewProps<T = unknown> {
  /** Tree data */
  data: TreeNode<T>[];
  /** Callback when node is selected */
  onSelect?: (node: TreeNode<T>) => void;
  /** IDs of expanded nodes */
  expandedNodes?: string[];
  /** Callback when node is expanded/collapsed */
  onToggle?: (nodeId: string, isExpanded: boolean) => void;
  /** Allow multiple selection */
  multiSelect?: boolean;
  /** Selected node IDs */
  selectedNodes?: string[];
  /** Optional aria-label */
  ariaLabel?: string;
  /** Optional className */
  className?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible tree view component with keyboard navigation
 *
 * @example
 * ```tsx
 * const treeData = [
 *   {
 *     id: '1',
 *     label: 'Documents',
 *     children: [
 *       { id: '1-1', label: 'Reports' },
 *       { id: '1-2', label: 'Invoices' }
 *     ]
 *   },
 *   { id: '2', label: 'Images' }
 * ];
 *
 * <AccessibleTreeView
 *   data={treeData}
 *   onSelect={(node) => console.log(node)}
 * />
 * ```
 */
export function AccessibleTreeView<T = unknown>({
  data,
  onSelect,
  expandedNodes: controlledExpanded,
  onToggle,
  multiSelect = false,
  selectedNodes: controlledSelected = [],
  ariaLabel = 'Tree navigation',
  className = '',
  style = {},
}: AccessibleTreeViewProps<T>): React.ReactElement {
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(new Set());
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  const treeId = useId('tree');

  const expandedSet = controlledExpanded
    ? new Set(controlledExpanded)
    : internalExpanded;

  const selectedSet = new Set(controlledSelected.length > 0 ? controlledSelected : Array.from(internalSelected));

  const toggleNode = (nodeId: string) => {
    const isExpanded = expandedSet.has(nodeId);

    if (controlledExpanded) {
      onToggle?.(nodeId, !isExpanded);
    } else {
      setInternalExpanded((prev) => {
        const next = new Set(prev);
        if (isExpanded) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      });
    }
  };

  const selectNode = (node: TreeNode<T>) => {
    if (node.disabled) return;

    if (multiSelect) {
      setInternalSelected((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
    } else {
      setInternalSelected(new Set([node.id]));
    }

    onSelect?.(node);
  };

  const getAllNodes = (nodes: TreeNode<T>[]): TreeNode<T>[] => {
    const result: TreeNode<T>[] = [];
    const traverse = (nodeList: TreeNode<T>[]) => {
      for (const node of nodeList) {
        result.push(node);
        if (node.children && expandedSet.has(node.id)) {
          traverse(node.children);
        }
      }
    };
    traverse(nodes);
    return result;
  };

  const handleKeyDown = (event: React.KeyboardEvent, node: TreeNode<T>, allNodes: TreeNode<T>[]) => {
    const currentIndex = allNodes.findIndex((n) => n.id === node.id);

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectNode(node);
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < allNodes.length - 1) {
          const nextNode = allNodes[currentIndex + 1];
          document.getElementById(`${treeId}-${nextNode.id}`)?.focus();
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          const prevNode = allNodes[currentIndex - 1];
          document.getElementById(`${treeId}-${prevNode.id}`)?.focus();
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (node.children && node.children.length > 0) {
          if (!expandedSet.has(node.id)) {
            toggleNode(node.id);
          } else if (node.children[0]) {
            document.getElementById(`${treeId}-${node.children[0].id}`)?.focus();
          }
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (node.children && expandedSet.has(node.id)) {
          toggleNode(node.id);
        }
        break;

      case 'Home':
        event.preventDefault();
        if (allNodes[0]) {
          document.getElementById(`${treeId}-${allNodes[0].id}`)?.focus();
        }
        break;

      case 'End':
        event.preventDefault();
        if (allNodes[allNodes.length - 1]) {
          document.getElementById(`${treeId}-${allNodes[allNodes.length - 1].id}`)?.focus();
        }
        break;
    }
  };

  const renderNode = (node: TreeNode<T>, level: number, allNodes: TreeNode<T>[]): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedSet.has(node.id);
    const isSelected = selectedSet.has(node.id);

    const nodeStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      paddingLeft: `${12 + level * 24}px`,
      cursor: node.disabled ? 'not-allowed' : 'pointer',
      backgroundColor: isSelected ? '#e5e7eb' : 'transparent',
      borderRadius: '4px',
      opacity: node.disabled ? 0.5 : 1,
    };

    const iconStyles: React.CSSProperties = {
      width: '16px',
      textAlign: 'center',
      transition: 'transform 0.2s',
      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
    };

    return (
      <React.Fragment key={node.id}>
        <div
          id={`${treeId}-${node.id}`}
          role="treeitem"
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-selected={isSelected}
          aria-level={level + 1}
          aria-disabled={node.disabled}
          tabIndex={isSelected ? 0 : -1}
          onClick={() => {
            if (!node.disabled) {
              if (hasChildren) {
                toggleNode(node.id);
              }
              selectNode(node);
            }
          }}
          onKeyDown={(e) => handleKeyDown(e, node, allNodes)}
          style={nodeStyles}
          onMouseEnter={(e) => {
            if (!node.disabled && !isSelected) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (!node.disabled && !isSelected) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {hasChildren ? (
            <span aria-hidden="true" style={iconStyles}>
              ▶
            </span>
          ) : (
            <span style={{ width: '16px' }} />
          )}
          <span>{node.label}</span>
        </div>
        {hasChildren && isExpanded && (
          <div role="group">
            {node.children!.map((child) => renderNode(child, level + 1, allNodes))}
          </div>
        )}
      </React.Fragment>
    );
  };

  const allNodes = getAllNodes(data);

  const containerStyles: React.CSSProperties = {
    ...style,
  };

  return (
    <div
      id={treeId}
      role="tree"
      aria-label={ariaLabel}
      aria-multiselectable={multiSelect}
      className={className}
      style={containerStyles}
    >
      {data.map((node) => renderNode(node, 0, allNodes))}
    </div>
  );
}
