import React, { useState } from 'react'
import SortableList, { SortableItemProps } from './SortableList'


interface Item {
  title: string
}

function ItemVerticalComponent(props: SortableItemProps<Item>) {
  const { item, isDragged, isDragItemInsertAfter, isDragItemInsertBefore } = props

  return (
    <div 
      className='item'
      style={{
        opacity: isDragged ? '0.3' : undefined,
        borderTopColor: isDragItemInsertBefore ? 'yellow' : undefined,
        borderBottomColor: isDragItemInsertAfter ? 'yellow' : undefined,
      }}>
        {item.title}
    </div>
  )
}

function ItemHorizontalComponent(props: SortableItemProps<Item>) {
  const { item, isDragged, isDragItemInsertAfter, isDragItemInsertBefore } = props

  return (
    <div 
      className='item' 
      style={{
        opacity: isDragged ? '0.3' : undefined,
        borderLeftColor: isDragItemInsertBefore ? 'yellow' : undefined,
        borderRightColor: isDragItemInsertAfter ? 'yellow' : undefined,
      }}>
        {item.title}
    </div>
  )
}

const preset = [
  { title: 'item #1'},
  { title: 'item #2'},
  { title: 'item #3'},
  { title: 'item #4'},
  { title: 'item #5'},
]

function App() {
  const [items, setItems] = useState<Item[]>(preset)

  const handlerSort = (sourceIndex: number, targetIndex: number) => {
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
  }

  return (
    <>
      <h1>Example</h1>

      <h2>Vertical list</h2>
      <SortableList className='list-vertical' items={items} onSort={handlerSort}>
        {props => <ItemVerticalComponent  {...props} />}
      </SortableList>

      <h2>Horizontal list</h2>
      <SortableList className='list-horizontal' items={items} onSort={handlerSort} direction='horizontal'>
        {props => <ItemHorizontalComponent {...props} />}
      </SortableList>
    </>
  )
}

export default App
