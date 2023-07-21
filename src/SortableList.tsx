import React, { useState, useEffect } from 'react'
import useLongPress from './hooks/useLongPress'
import { createPortal } from 'react-dom'

enum Position {
  before = 0,
  after
}

export type Direction = 'vertical' | 'horizontal'

export interface SortableItemProps<T> {
  item: T
  isDragItemInsertBefore: boolean
  isDragItemInsertAfter: boolean
  isDragged: boolean
  isHovered: boolean
}

export interface SortableListProps<T> {
  items: T[]
  direction?: Direction
  className?: string
  style?: React.CSSProperties
  children: (props: SortableItemProps<T>, index: number) => React.ReactElement
  onSort: (sourceIndex: number, targetIndex: number) => void
}

const shouldInsertBefore = (sourceIndex: number | null, targetIndex: number | null, index: number) => {
  if (sourceIndex == null || targetIndex == null) {
    return false
  }
  if (targetIndex >= sourceIndex) {
    return targetIndex === index - 1
  }
  return targetIndex === index
}

const shouldInsertAfter = (sourceIndex: number | null, targetIndex: number | null, index: number) => {
  if (sourceIndex == null || targetIndex == null) {
    return false
  }
  if (targetIndex > sourceIndex) {
    return targetIndex === index
  }
  return targetIndex === index + 1
}

function useDragPreventAnimation(sourceIndex: number | null) {
    useEffect(() => {
        const handler = (e: DragEvent) => {
          if (sourceIndex !== null) {
            e.preventDefault()
          }
        }

        document.addEventListener('dragover', handler)

        return () => {
          document.removeEventListener('dragover', handler)
        }

    }, [sourceIndex])
}

function calculateInsertPosition(e: React.DragEvent<HTMLDivElement>, direction: Direction) : Position {
    const { top, left, width, height } = e.currentTarget.getBoundingClientRect()

    if (direction === 'vertical') {
        return e.clientY < top + height / 2 ? Position.before : Position.after
    }

    return e.clientX < left + width / 2 ? Position.before : Position.after
}

function calculationTargetIndex(position: Position, sourceIndex: number, index: number): number {
    if (sourceIndex === index) {
        return index
    }

    if (sourceIndex < index) {
      if (position === Position.before) {
        return Math.max(0, index - 1)
      }

      return index
    }

    if (position === Position.before) {
      return index
    }

    return index + 1
}

export function SortableList<T>(props: SortableListProps<T>) {
    const [sourceIndex, setSourceIndex] = useState<number | null>(null)
    const [hoveredItem, setHoveredItem] = useState<number| null>(null)
    const [targetIndex, setTargetIndex] = useState<number | null>(null)
    const [mouse, setMouse] = useState<[number, number]>([0, 0]);

    const { items, direction = 'vertical', className, style, onSort } = props

    useDragPreventAnimation(sourceIndex)

    useEffect(() => {
      const stopTextHighline = (e: any) => e.preventDefault();
  
      document.addEventListener("selectstart", stopTextHighline);

      return () => document.removeEventListener("selectstart", stopTextHighline);
    }, []);

    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (sourceIndex !== null) {
          e.preventDefault();
          setSourceIndex(null);
        }
      };

      document.addEventListener("mouseup", handler);

      return () => document.removeEventListener("mouseup", handler);
    }, []);

    useEffect(() => {
      const handler = (e: MouseEvent) => {
        setMouse([e.x, e.y]);
      };
  
      document.addEventListener("mousemove", handler);
  
      return () => document.removeEventListener("mousemove", handler);
    }, []);

    return (
      <>
      {sourceIndex !== null && (console.log('sourceIndex', sourceIndex) || true) && (
        <div
          className={className}
          style={{
            ...style,
            position: "absolute",
            backgroundColor: "red",
            left: `${mouse[0]}px`,
            top: `${mouse[1]}px`
          }}
          onMouseUp={(e) => {
            console.log('onMouseUp 000')
            e.preventDefault()

            if (sourceIndex !== null && targetIndex !== null) {
              onSort(sourceIndex, targetIndex)
            }

            setTargetIndex(null)
            setSourceIndex(null)
            setHoveredItem(null)
          }}
        >
          {props.children({
                item: items[sourceIndex],
                isDragItemInsertBefore: shouldInsertBefore(sourceIndex, targetIndex, sourceIndex),
                isDragItemInsertAfter: shouldInsertAfter(sourceIndex, targetIndex, sourceIndex),
                isDragged: false,
                isHovered: false
              }, sourceIndex)}
        </div>
      )}
        <div className={className} style={style}>
          {items.map((item, index) =>
            <div
              draggable={false}
              onClick={(e) => e.preventDefault() }
              key={index}
              onDragStart={() => setSourceIndex(index)}
              onDragEnter={() => setHoveredItem(index)}
              onDragOver={(e) => {
                e.preventDefault()

                if (sourceIndex === null) {
                  return
                }

                const position = calculateInsertPosition(e, direction)
                const targetIndex = calculationTargetIndex(position, sourceIndex, index)

                setTargetIndex(targetIndex)
              }}
              onDragEnd={(e) => {
                e.preventDefault()

                if (sourceIndex !== null && targetIndex !== null) {
                  onSort(sourceIndex, targetIndex)
                }

                setTargetIndex(null)
                setSourceIndex(null)
                setHoveredItem(null)
              }}
              // {...useLongPress(() => setSourceIndex(index), () => setSourceIndex(null))}
              onMouseDown={(e) => { setSourceIndex(index); setHoveredItem(index)}}
              onMouseUp={(e) => {
                console.log('onMouseUp')
                e.preventDefault()

                if (sourceIndex !== null && targetIndex !== null) {
                  onSort(sourceIndex, targetIndex)
                }

                setTargetIndex(null)
                setSourceIndex(null)
                setHoveredItem(null)
              }}
              onMouseMove={(e) => {
                e.preventDefault()

                if (sourceIndex === null) {
                  return
                }

                const position = calculateInsertPosition(e, direction)
                const targetIndex = calculationTargetIndex(position, sourceIndex, index)

                setTargetIndex(targetIndex)
              }}
            >
              {props.children({
                item,
                isDragItemInsertBefore: shouldInsertBefore(sourceIndex, targetIndex, index),
                isDragItemInsertAfter: shouldInsertAfter(sourceIndex, targetIndex, index),
                isDragged: sourceIndex === index,
                isHovered: hoveredItem === index
              }, index)}
            </div>
          )}
        </div>
      </>
    )
}
