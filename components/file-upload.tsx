'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Paperclip, X } from 'lucide-react'

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
}

export function FileUpload ({ onFilesChange }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      
      setFiles(prev => {
        const updated = [...prev, ...newFiles]
    
        return updated
      })
      
      onFilesChange(newFiles)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index)
      onFilesChange(updated)
      return updated
    })
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <Button
          type='button'
          variant='outline'
          onClick={() => document.getElementById('file-upload')?.click()}
          className='gap-2 font-bold text-xl'
        >
          <Paperclip className='h-4 w-4' />
          إضافة مرفق
        </Button>
        <Input
          id='file-upload'
          type='file'
          multiple
          className='hidden'
          onChange={handleFileChange}
        />
      </div>

      {files.length > 0 && (
        <div className='space-y-2'>
          {files.map((file, index) => (
            <div
              key={index}
              className='flex items-center justify-between gap-2 p-2 border rounded'
            >
              <span className='text-sm'>{file.name}</span>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => removeFile(index)}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
