import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { SortableList, SortableItemProps } from './SortableList'

const itemStyle = {
  padding: '20px 10px',
  background: '#fff',
  border: '2px solid',
  borderColor: '#000'
};

interface Item {
  title: string
}

function ItemHorizontalComponent(props: SortableItemProps<Item>) {
  const { item, isDragged, isDragItemInsertAfter, isDragItemInsertBefore } = props

  return (
    <div
      style={{
        opacity: isDragged ? '0.3' : undefined,
        borderLeftColor: isDragItemInsertBefore ? 'yellow' : undefined,
        borderRightColor: isDragItemInsertAfter ? 'yellow' : undefined,
        ...itemStyle
      }}>
        {item.title}
    </div>
  )
}

function ItemVerticalComponent(props: SortableItemProps<Item>) {
  const { item, isDragged, isDragItemInsertAfter, isDragItemInsertBefore } = props

  return (
    <div
      style={{
        opacity: isDragged ? '0.3' : undefined,
        borderTopColor: isDragItemInsertBefore ? 'yellow' : undefined,
        borderBottomColor: isDragItemInsertAfter ? 'yellow' : undefined,
        ...itemStyle
      }}>
        {item.title}
    </div>
  )
}

const createPreset = () => [
  { title: 'item #1'},
  { title: 'item #2'},
  { title: 'item #3'},
  { title: 'item #4'},
  { title: 'item #5'},
]

const createSortHandler = (setItems: Dispatch<SetStateAction<Item[]>>) => (sourceIndex: number, targetIndex: number) => {
  console.log('sourceIndex',sourceIndex)
  if (sourceIndex === targetIndex) {
    return
  }

  setItems(originItems => {
    console.log('setItems', originItems)
    const items = originItems.slice()
    const item = items[sourceIndex]

    items.splice(sourceIndex, 1)
    items.splice(targetIndex, 0 ,item)

    return items
  })
}

const verticalListStyle: React.CSSProperties = {
  background: '#ccc',
  padding: '10px',
  display: 'flex',
  gap: '4px',
  width: '400px',
  flexDirection: 'column'
};

export const Vertical = () => {
  const [items, setItems] = useState<Item[]>(createPreset())
  const sortHandler = useCallback(createSortHandler(setItems), [])

  return (
    <SortableList style={verticalListStyle} items={items} onSort={sortHandler} direction='vertical'>
      {props => <ItemVerticalComponent {...props} data-help="help"/>}
    </SortableList>
  )
};

const horizontalListStyle: React.CSSProperties = {
  background: '#ccc',
  padding: '10px',
  display: 'flex',
  gap: '4px',
  width: '400px',
  flexDirection: 'row'
};

export const Horizontal = () => {
  const [items, setItems] = useState<Item[]>(createPreset())
  const sortHandler = createSortHandler(setItems)

  return (
    <SortableList style={horizontalListStyle} items={items} onSort={sortHandler} direction='horizontal'>
      {props => <ItemHorizontalComponent {...props} data-help="help"/>}
    </SortableList>
  )
};

export default {
  title: "SortableList",
  component: SortableList
};
