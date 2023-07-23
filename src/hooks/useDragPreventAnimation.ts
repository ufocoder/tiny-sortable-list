import { useEffect } from 'react'

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

export default useDragPreventAnimation;
