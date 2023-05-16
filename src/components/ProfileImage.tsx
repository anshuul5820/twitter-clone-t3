import Image from 'next/image'
import React from 'react'

type ProfileImageProps = {
    src?: string | null
    className?: string
}

const ProfileImage = ({ src, className = "" }: ProfileImageProps) => {
    return (
        <div className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}>
            {!!src && <Image src={src} alt="profile image" quality={100} fill />}

            {/* fill required relative in parent container */}
        </div>
    )
}

export default ProfileImage
