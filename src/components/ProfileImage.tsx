import Image from "next/image";
import React from "react";
import { VscAccount } from "react-icons/vsc";

type ProfileImageProps = {
  src?: string | null;
  className?: string;
};

const ProfileImage = ({ src, className = "" }: ProfileImageProps) => {
  return (
    <div
      className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}
    >
      {!!src && <Image src={src} alt="profile image" quality={100} fill />}
      {!src && <VscAccount className="h-full w-full" />}

      {/* fill required relative in parent container */}
    </div>
  );
};

export default ProfileImage;
