import React, { useState, useEffect, useCallback, SyntheticEvent, cloneElement, Children, useRef } from 'react'

enum Position {
  before = 0,
  after
}

export type Direction = 'vertical' | 'horizontal'

export interface SortableItemProps<T> {
  item: T
  isDragItemInsertBefore?: boolean
  isDragItemInsertAfter?: boolean
  isDragged?: boolean
  isHovered?: boolean
}

export interface SortableListProps<T> {
  items: T[]
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  direction?: Direction
  className?: string
  style?: React.CSSProperties
  children: (props: SortableItemProps<T>, index: number) => React.ReactElement
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

function calculateInsertPosition(e: React.PointerEvent<HTMLDivElement>, direction: Direction) : Position {
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


interface DraggableItemProps<T> {
  item: T;
  itemRect: DOMRect;
  index: number;
  coords: Coords;
  children: (props: SortableItemProps<T>, index: number) => React.ReactElement;
}

function DraggableItem<T>(props: DraggableItemProps<T>) {
  const { item, itemRect, index, coords,  } = props;

  return (
    <div style={{
      position: 'absolute',
      zIndex: 9,
      left: coords.x,
      top: coords.y,
      width: itemRect.width,
      height: itemRect.height,
      pointerEvents: 'none'
    }}>
      {props.children({ item }, index)}
    </div>
  )
}


interface Coords {
  x: number;
  y: number;
}

export function SortableList<T>(props: SortableListProps<T>) {
    const [sourceIndex, setSourceIndex] = useState<number | null>(null)
    const [hoveredIndex, setHoveredIndex] = useState<number| null>(null)
    const [targetIndex, setTargetIndex] = useState<number | null>(null)

    const [sourceRect, setSourceRect] = useState<DOMRect>()
    const [pointerDownPosition, setPointerDownPosition] = useState<Coords>({ x: 0, y: 0 });
    const [pointerMovePosition, setPointerMovePosition] = useState<Coords>({ x: 0, y: 0 });

    const { items, setItems, direction = 'vertical', className, style } = props

    const sortHandler = useCallback((sourceIndex: number, targetIndex: number) => {
      if (sourceIndex === targetIndex) {
        return
      }
  
      setItems(originItems => {
        const items = originItems.slice()
        const item = items[sourceIndex]
  
        items.splice(sourceIndex, 1)
        items.splice(targetIndex, 0 ,item)
  
        return items
      })
    }, [setItems])

    useDragPreventAnimation(sourceIndex)


    useEffect(() => {
      const handlePointerUp = (e: PointerEvent) => {
        e.preventDefault()

        if (sourceIndex !== null && targetIndex !== null) {
          sortHandler(sourceIndex, targetIndex)
        }

        setTargetIndex(null)
        setSourceIndex(null)
        setHoveredIndex(null)
      }

      document.addEventListener('pointerup', handlePointerUp);

      return () => {
        document.removeEventListener('pointerup', handlePointerUp);
      };
    })


    useEffect(() => {
      const handlePointerMove = (e: PointerEvent) => {
        e.preventDefault()

        if (sourceIndex == null) {
          return
        }

        setPointerMovePosition({ x: e.pageX, y: e.pageY })
      }

      document.addEventListener('pointermove', handlePointerMove);

      return () => {
        document.removeEventListener('pointermove', handlePointerMove);
      };
    })

    return (
        <div className={className} style={style}>
          {sourceIndex !== null && items[sourceIndex] 
            ? <DraggableItem 
                item={items[sourceIndex]}
                itemRect={sourceRect!}
                index={sourceIndex} 
                coords={{
                  x: pointerMovePosition.x - pointerDownPosition.x,
                  y: pointerMovePosition.y - pointerDownPosition.y,
                }}
                children={props.children} /> 
            : null}
          {items.map((item, index) => {
            const itemRef = useRef<HTMLDivElement>(null);

            const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
              if (!itemRef.current) {
                return
              }

              setSourceRect(e.currentTarget.getBoundingClientRect())
              setPointerDownPosition({ x: e.pageX, y: e.pageY })
              setSourceIndex(index)

              return;
            };

            const handlePointerEnter = () => setHoveredIndex(index)

            const handlePointerOver = (e: React.PointerEvent<HTMLDivElement>) => {
              e.preventDefault()

              

              if (sourceIndex === null) {
                console.log('hover', item)
                setHoveredIndex(index);
                return
              }

              const position = calculateInsertPosition(e, direction)
              const targetIndex = calculationTargetIndex(position, sourceIndex, index)

              setTargetIndex(targetIndex)
            }

            return (
              <div
                ref={itemRef}
                key={index}
                onPointerDown={handlePointerDown}
                onPointerEnter={handlePointerEnter}
                onPointerOver={handlePointerOver}
              >
                {props.children({
                  item,
                  isDragItemInsertBefore: shouldInsertBefore(sourceIndex, targetIndex, index),
                  isDragItemInsertAfter: shouldInsertAfter(sourceIndex, targetIndex, index),
                  isDragged: sourceIndex === index,
                  isHovered: hoveredIndex === index
                }, index)}
              </div>
            );
        })}
      </div>
    )
}
