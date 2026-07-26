import Icon from "#shared/ui/atoms/icons";
import type { TagProps } from "./tag.type";

export default function Tag({ title, icon, color, checked }: TagProps) {
  return (
    <div className="tag" style={{ "--tag__color": `hsl(${color}, 100%, 50%)` } as React.CSSProperties}>
      <Icon name={icon} size={8} />
      <span className="tag__title">{title}</span>
      <Icon name={checked ? "IconCircleDashed" : "IconCircleCheck"} />
    </div>
  );
}
