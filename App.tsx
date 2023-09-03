import React, { useState } from 'react';
import { type SortableItemProps, SortableList } from './src/SortableList';
const itemStyle = {
  padding: '20px 10px',
  background: '#fff',
  border: '2px solid',
  borderTopColor: '#000',
  borderLeftColor: '#000',
  borderRightColor: '#000',
  borderBottomColor: '#000'
}

interface Item {
  title: string
}

function ItemHorizontalComponent (props: SortableItemProps<Item>): React.ReactElement {
  const { item, isDragged, isDragItemInsertAfter, isDragItemInsertBefore } = props

  return (
    <div
      style={{
        ...itemStyle,
        opacity: isDragged ? '0.3' : undefined,
        borderLeftColor: isDragItemInsertBefore ? 'yellow' : '#000',
        borderRightColor: isDragItemInsertAfter ? 'yellow' : '#000'
      }}>
        {item.title}
    </div>
  )
}

function ItemVerticalComponent (props: SortableItemProps<Item>): React.ReactElement {
  const { item, isDragged, isDragItemInsertAfter, isDragItemInsertBefore } = props

  return (
    <div
      style={{
        ...itemStyle,
        opacity: isDragged ? '0.3' : undefined,
        borderTopColor: isDragItemInsertBefore ? 'yellow' : '#000',
        borderBottomColor: isDragItemInsertAfter ? 'yellow' : '#000'
      }}>
        {item.title}
    </div>
  )
}

const createPreset = (): Item[] => [
  { title: 'item #1' },
  { title: 'item #2' },
  { title: 'item #3' },
  { title: 'item #4' },
  { title: 'item #5' }
]

const verticalListStyle: React.CSSProperties = {
  background: '#ccc',
  padding: '10px',
  display: 'flex',
  gap: '4px',
  width: '400px',
  flexDirection: 'column'
}

export const Vertical = (): React.ReactElement => {
  const [items, setItems] = useState<Item[]>(createPreset())

  return (
    <SortableList style={verticalListStyle} items={items} setItems={setItems} direction='vertical'>
      {props => <ItemVerticalComponent {...props} />}
    </SortableList>
  )
}

const horizontalListStyle: React.CSSProperties = {
  background: '#ccc',
  padding: '10px',
  display: 'flex',
  gap: '4px',
  width: '400px',
  flexDirection: 'row'
}

const App = (): React.ReactElement => {
  const [vItems, setVitems] = useState(createPreset())
  const [hItems, setHitems] = useState(createPreset())

  return (
    <>
      <h1>Example</h1>
      <h2>Vertical</h2>
      <SortableList style={verticalListStyle} items={vItems} setItems={setVitems} direction='vertical'>
        {props => <ItemVerticalComponent {...props} />}
      </SortableList>
      <h2>Horizontal</h2>
      <SortableList style={horizontalListStyle} items={hItems} setItems={setHitems} direction='horizontal'>
        {props => <ItemHorizontalComponent {...props} />}
      </SortableList>
    </>
  )
}

export default App