import React, { useState, useEffect, useRef } from 'react'

enum Position {
  before = 0,
  after
}

type Direction = 'vertical' | 'horizontal'

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
  children: (props: SortableItemProps<T>) => React.ReactElement
  onSort: (sourceIndex: number, targetIndex: number) => void
}

export interface InsertPointProps {
  isVisible: boolean,
  size: number,
  position: number,
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

function calcTargetInsertPointPosition(targetIndex: number, insertPosition: Position, e: React.DragEvent<HTMLDivElement>, direction: Direction): number {
  const { width, height } = e.currentTarget.getBoundingClientRect()

  const itemSize = direction === 'vertical' ? height : width

  return itemSize * ( targetIndex + insertPosition) + 2 * (targetIndex + insertPosition + 1)
}

export function HorisontalInsertPoint(props: InsertPointProps) {
  const { isVisible, size, position } = props

  const height = `${size}px`
  const translateX = position ? `translate(${position}px, 0px)` : 'translate(2px, 0px)'

  return <div
    className='horizontal-insert'
    style={{
      visibility: isVisible ? 'visible' : 'hidden',
      height: height,
      transform: translateX,
    }}
  />
}

export function VerticalInsertPoint(props: InsertPointProps) {
  const { isVisible, size, position = 2 } = props
  
  const width = `${size}px`
  const translateY = position ? `translate(0px, ${position}px)` : 'translate(0px, 2px)'

  return <div
    className='vertical-insert'
    style={{
      visibility: isVisible ? 'visible' : 'hidden',
      width: width,
      transform: translateY,
    }}
  />
}

export default function ListComponent<T>(props: SortableListProps<T>) {
    const [sourceIndex, setSourceIndex] = useState<number | null>(null)
    const [hoveredItem, setHoveredItem] = useState<number| null>(null)
    const [targetIndex, setTargetIndex] = useState<number | null>(null)

    const [isVisibleInsertPoint, setVisibleInsertPoint] = useState<boolean>(false)
    const [targetInsertPointPosition, setTargetInsertPointPosition] = useState<number | null>(null)

    const childRef = useRef<HTMLDivElement | null>(null)
  
    const { items, direction = 'vertical', className, onSort } = props

    useDragPreventAnimation(sourceIndex)

    return (
        <div className={className}>
          {direction === 'vertical'
            ? <VerticalInsertPoint
                isVisible={isVisibleInsertPoint}
                size={childRef.current?.clientWidth!}
                position={targetInsertPointPosition!}
              />
            : <HorisontalInsertPoint
                isVisible={isVisibleInsertPoint}
                size={childRef.current?.clientHeight!}
                position={targetInsertPointPosition!}
              />
          }
          {items.map((item, index) => {

            return (
              <div
                className='wrap-item'
                ref={childRef}
                key={index}
                draggable
                onDragStart={() => {
                  setVisibleInsertPoint(true)
                  setSourceIndex(index)
                }}
                onDragEnter={() => setHoveredItem(index)}
                onDragOver={(e) => {
                  e.preventDefault()
  
                  if (sourceIndex === null) {
                    return
                  }

                  const position = calculateInsertPosition(e, direction)
                  const targetIndex = calculationTargetIndex(position, sourceIndex, index)
                  const targetInsertPointPosition = calcTargetInsertPointPosition(hoveredItem!, position, e, direction)

                  setTargetInsertPointPosition(targetInsertPointPosition)
                  setTargetIndex(targetIndex)
                }}
                onDragEnd={(e) => {
                  e.preventDefault()
  
                  if (sourceIndex !== null && targetIndex !== null) {
                    onSort(sourceIndex, targetIndex)
                  }
                  setVisibleInsertPoint(false)
                  setTargetIndex(null)
                  setSourceIndex(null)
                  setHoveredItem(null)
                }}
              >
                {props.children({ 
                  item,
                  isDragItemInsertBefore: shouldInsertBefore(sourceIndex, targetIndex, index),
                  isDragItemInsertAfter: shouldInsertAfter(sourceIndex, targetIndex, index),
                  isDragged: sourceIndex === index,
                  isHovered: hoveredItem === index
                })}
              </div>
            )
          })}
        </div>
    )
  }
