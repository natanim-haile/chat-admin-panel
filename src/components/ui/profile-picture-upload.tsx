'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2, X } from 'lucide-react'
import { Button } from './button'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

interface ProfilePictureUploadProps {
    userId: string
    currentImage?: string | null
    userName: string
    onUploadSuccess?: (url: string) => void
}

export function ProfilePictureUpload({
    userId,
    currentImage,
    userName,
    onUploadSuccess,
}: ProfilePictureUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(currentImage || null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
            return
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            setError('File too large. Maximum size is 5MB.')
            return
        }

        setError(null)
        setUploading(true)

        try {
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)

            // Upload file
            const formData = new FormData()
            formData.append('file', file)
            formData.append('userId', userId)

            const response = await fetch('/api/upload/profile-picture', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            setPreview(data.url)
            onUploadSuccess?.(data.url)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
            setPreview(currentImage || null)
        } finally {
            setUploading(false)
        }
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleRemove = () => {
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={preview || undefined} alt={userName} />
                    <AvatarFallback className="text-2xl">
                        {userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                {preview && !uploading && (
                    <button
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 hover:bg-destructive/90"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
            />

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={uploading}
            >
                {uploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Picture
                    </>
                )}
            </Button>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    )
}
