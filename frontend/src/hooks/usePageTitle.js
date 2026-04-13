import { useEffect } from 'react'

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title
      ? `${title} | ServiFind`
      : 'ServiFind — Local Services Finder'
    return () => {
      document.title = 'ServiFind — Local Services Finder'
    }
  }, [title])
}

export default usePageTitle