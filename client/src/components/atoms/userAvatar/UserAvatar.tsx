import { Blobatar } from "@blobatar/react";
import "blobatar/motion.css"; // animate renders inline SVG, not one <img>

export function UserAvatar({ name, size = 32 }: { name: string; size?: number }) {
  return <Blobatar name={name} size={size} animate="hover" title={name} />;
}
