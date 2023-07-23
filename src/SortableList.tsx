import React, { useState, useEffect } from 'react'
import useDragPreventAnimation from './hooks/useDragPreventAnimation'

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

function calculateInsertPosition(e: React.DragEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, direction: Direction) : Position {
    const { top, left, width, height } = e.currentTarget.getBoundingClientRect()
    const { clientY, clientX } = e?.touches?.[0] || e

    if (direction === 'vertical') {
        return clientY < top + height / 2 ? Position.before : Position.after
    }

    return clientX < left + width / 2 ? Position.before : Position.after
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

function getTargetIndex(e: React.TouchEvent<HTMLDivElement>): number | null {
  const { pageY, pageX } = e?.touches[0] || {}

  if (typeof pageY !== 'number') return null
  
  const targetElemContainer = document.elementFromPoint(pageX, pageY)?.parentElement
  const targetIndex = targetElemContainer?.getAttribute('data-index')

  return targetIndex ? Number(targetIndex) : null
}

export function SortableList<T>(props: SortableListProps<T>) {
    const [sourceIndex, setSourceIndex] = useState<number | null>(null)
    const [hoveredItem, setHoveredItem] = useState<number| null>(null)
    const [targetIndex, setTargetIndex] = useState<number | null>(null)
    const [pointer, setPointer] = useState<[number, number]>([0, 0]);
    const [pointerType, setPointerType] = useState<string | null>(null);
    const [draggableSize, setDraggableSize] = useState<[number, number]>([0, 0]);

    const { items, direction = 'vertical', className, style, onSort } = props

    useEffect(() => {
      const detectPointerType = (e: PointerEvent) => {
        if (e.pointerType === pointerType) return;

        setPointerType(e.pointerType)
      }

      document.addEventListener('pointerdown', detectPointerType);

      return () => document.removeEventListener('pointerdown', detectPointerType);
    })

    useDragPreventAnimation(sourceIndex)

    useEffect(() => {
      const stopTextHighline = (e: any) => e.preventDefault();
  
      document.addEventListener('selectstart', stopTextHighline);

      return () => document.removeEventListener('selectstart', stopTextHighline);
    }, []);

    useEffect(() => {
      const handler = (e: React.TouchEvent<HTMLDivElement> | TouchEvent) => {
        const { clientX, clientY } = e?.touches[0] || {}
        clientX && setPointer([clientX, clientY]);
      };
  
      document.addEventListener('touchmove', handler);
  
      return () => document.removeEventListener('touchmove', handler);
    }, []);

    return (
      <>
      {sourceIndex !== null && (pointerType !== 'mouse') && (
        <div
          className={className}
          style={{
            ...style,
            display: 'flex',
            width: `${draggableSize[0]}px`,
            position: 'absolute',
            margin: 0,
            padding: 0,
            pointerEvents: 'none',
            left: `${pointer[0] - draggableSize[0]/10}px`,
            top: `${pointer[1] - draggableSize[1]/10}px`
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
              data-index={index}
              draggable={pointerType === 'mouse'}
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
              onTouchStart={(e) => {
                const { clientX, clientY } = e?.touches[0] || {}

                const { width, height } = e.currentTarget.getBoundingClientRect()

                setDraggableSize([width, height])
                setPointer([clientX, clientY])
                setSourceIndex(index)
                setHoveredItem(index)
              }}
              onTouchEnd={(e) => {
                if (sourceIndex !== null && targetIndex !== null) {
                  onSort(sourceIndex, targetIndex)
                }

                setTargetIndex(null)
                setSourceIndex(null)
                setHoveredItem(null)
              }}
              onTouchMove={(e) => {
                if (sourceIndex === null) {
                  return
                }

                const targetIndex = getTargetIndex(e)

                setTargetIndex(targetIndex)
              }}
            >
              {props.children({
                item,
                isDragItemInsertBefore: shouldInsertBefore(sourceIndex, targetIndex, index),
                isDragItemInsertAfter: shouldInsertAfter(sourceIndex, targetIndex, index),
                isDragged: sourceIndex === index,
                isHovered: hoveredItem === index,
              }, index)}
            </div>
          )}
        </div>
      </>
    )
}
