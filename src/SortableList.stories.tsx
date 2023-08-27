import React, { useState } from 'react'
import { SortableList, SortableItemProps } from './SortableList'

const itemStyle = {
  padding: '20px 10px',
  background: '#fff',
  border: '2px solid #000'
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

  return (
    <SortableList style={verticalListStyle} items={items} setItems={setItems} direction='vertical'>
      {props => <ItemVerticalComponent {...props} />}
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
  const [items, setItems] = useState<Item[]>(createPreset());

  return (
    <SortableList style={horizontalListStyle} items={items} setItems={setItems} direction='horizontal'>
      {props => <ItemHorizontalComponent {...props} />}
    </SortableList>
  )
};

export default {
  title: "SortableList",
  component: SortableList
};
