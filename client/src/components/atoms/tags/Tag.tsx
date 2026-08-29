import Icon from "#shared/ui/atoms/icons";
import type { TagProps } from "./Tag.types";


export default function Tag({ title, icon, color, checked }: TagProps) {
  return (
    <div className="tag" style={{ "backgroundColor": `hsl(${color}, 100%, 80%)` }}>
      <Icon name={icon} size={8} color={`hsl(${color}, 100%, 80%)`}/>
      <span className="tag__title">{title}</span>
      <Icon name={checked ? "IconCircleDashed" : "IconCircleCheck"} size={8} color={`hsl(${color}, 100%, 25%)`}/>
    </div>
  );
}
