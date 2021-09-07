Sortable list
=============

![Build](https://github.com/light-slides/canvas/actions/workflows/build.yml/badge.svg)

Example of sortable list on React based on HTML [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)

## Usage

```typescript
interface Item {
  title: string
}

function App() {
  const [items, setItems] = useState<Item[]>([
    { title: 'item #1'},
    { title: 'item #2'},
    { title: 'item #3'},
    { title: 'item #4'},
    { title: 'item #5'},
  ])

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

  return (
    <SortableList items={items} onSort={sortHandler}>
      {props => <ItemVerticalComponent {...props} />}
    </SortableList>
  )
};
```

## Demo

![demo](./demo.gif)

## Contributors

Project was created during [youtube stream](https://www.youtube.com/watch?v=z3jzc1dgpAc) in collaboration with [Tim Khazamov](https://github.com/nanot1m/)
