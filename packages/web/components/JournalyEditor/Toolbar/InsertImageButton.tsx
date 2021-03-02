import React, { useCallback } from 'react'
import { useSlate } from 'slate-react'

import BaseToolbarButton from './BaseToolbarButton'
import { insertImage } from '../helpers'

const InsertImageButtton = ({ children }) => {
  const editor = useSlate()
  const fileInput = React.useRef<HTMLInputElement>(null)

  const handleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    if (fileInput && fileInput.current) {
      fileInput.current.click()
    }
  }, [editor, fileInput])

  const handleChange = useCallback((event: HTMLInputEvent) => {
    event.preventDefault()
    const files = event.target.files
    if (files) {
      insertImage(editor, files[0])
    }
    event.target.value = ''
  }, [editor, fileInput])

  return (
    <>
      <BaseToolbarButton active={false} onClick={handleClick}>
        {children}
      </BaseToolbarButton>
      <input
        className="file-input"
        onChange={handleChange}
        type="file"
        ref={fileInput}
      />
      <style jsx>{`
        .file-input {
          display: none;
        }
      `}</style>
    </>
  )
}

export default InsertImageButtton
