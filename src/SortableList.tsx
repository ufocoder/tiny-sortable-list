import React, { useState, useEffect, useCallback, SyntheticEvent } from 'react'
import './pollyfill'

enum Position {
  before = 0,
  after,
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
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  direction?: Direction
  className?: string
  style?: React.CSSProperties
  children: (props: SortableItemProps<T>, index: number) => React.ReactElement
}

const shouldInsertBefore = (sourceIndex: number | null, targetIndex: number | null, index: number): boolean => {
  if (sourceIndex == null || targetIndex == null) {
    return false
  }
  if (targetIndex >= sourceIndex) {
    return targetIndex === index - 1
  }
  return targetIndex === index
}

const shouldInsertAfter = (sourceIndex: number | null, targetIndex: number | null, index: number): boolean => {
  if (sourceIndex == null || targetIndex == null) {
    return false
  }
  if (targetIndex > sourceIndex) {
    return targetIndex === index
  }
  return targetIndex === index + 1
}

function useDragPreventAnimation (sourceIndex: number | null): void {
  useEffect(() => {
    const handler = (e: DragEvent): void => {
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

function calculateInsertPosition (e: React.DragEvent<HTMLDivElement>, direction: Direction): Position {
  const { top, left, width, height } = e.currentTarget.getBoundingClientRect()

  if (direction === 'vertical') {
    return e.clientY < top + height / 2 ? Position.before : Position.after
  }

  return e.clientX < left + width / 2 ? Position.before : Position.after
}

function calculationTargetIndex (position: Position, sourceIndex: number, index: number): number {
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

export function SortableList<T> (props: SortableListProps<T>): React.ReactElement {
  const [sourceIndex, setSourceIndex] = useState<number | null>(null)
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  const [targetIndex, setTargetIndex] = useState<number | null>(null)

  const { items, setItems, direction = 'vertical', className, style } = props

  const sortHandler = useCallback(
    (sourceIndex: number, targetIndex: number): void => {
      if (sourceIndex === targetIndex) {
        return
      }

      setItems((originItems) => {
        const items = originItems.slice()
        const item = items[sourceIndex]

        items.splice(sourceIndex, 1)
        items.splice(targetIndex, 0, item)

        return items
      })
    },
    [setItems]
  )

  useDragPreventAnimation(sourceIndex)

    return (
        <div className={className} style={style}>
          {items.map((item, index) => {

            const handleStart = () => setSourceIndex(index)
            const handleEnter = () => setHoveredItem(index)
            const handleOver = (e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault()

              if (sourceIndex === null) {
                return
              }

              const position = calculateInsertPosition(e, direction)
              const targetIndex = calculationTargetIndex(position, sourceIndex, index)

              setTargetIndex(targetIndex)
            }

            const handleEnd = (e: SyntheticEvent) => {
              e.preventDefault()

              if (sourceIndex !== null && targetIndex !== null) {
                sortHandler(sourceIndex, targetIndex)
              }

              setTargetIndex(null)
              setSourceIndex(null)
              setHoveredItem(null)
            }

            return (
              <div
                draggable
                key={index}
                onDragStart={handleStart}
                onDragEnter={handleEnter}
                onDragOver={handleOver}
                onDragEnd={handleEnd}
              >
                {props.children({
                  item,
                  isDragItemInsertBefore: shouldInsertBefore(sourceIndex, targetIndex, index),
                  isDragItemInsertAfter: shouldInsertAfter(sourceIndex, targetIndex, index),
                  isDragged: sourceIndex === index,
                  isHovered: hoveredItem === index
                }, index)}
              </div>
            );
        })}
    </div>
  )
}
