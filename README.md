Tiny sortable list
==================

![Build](https://github.com/ufocoder/tiny-sortable-list/actions/workflows/build.yml/badge.svg)

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

  return (
    <SortableList items={items} setItems={setItems}>
      {props => <ItemVerticalComponent {...props} />}
    </SortableList>
  )
};
```

## Demo

![demo](./demo.gif)

## Contributors

- [Sergey Ufocoder](https://github.com/ufocoder/) 
- [Tim Khazamov](https://github.com/nanot1m/)
