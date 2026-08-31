import Tag from "#components/atoms/tags/Tag";

export default function SelectionTagForm() {
  return (
    <div>
      <h1>Seleccione sus intereses</h1>
      <p>Esto nos ayudará a personalizar su experiencia en la aplicación.</p>
      <div className="tag-form__tags">
        <Tag
          title="Productividad"
          icon="IconFileCheck"
          color={150}
          checked={true}
        />
        <Tag title="Salud" icon="IconHeart" color={150} checked={false} />
        <Tag title="Educación" icon="IconBook" color={150} checked={false} />
        <Tag title="Trabajo" icon="IconBriefcase" color={150} checked={true} />
        <Tag title="Hogar" icon="IconHome" color={150} checked={false} />
        <Tag
          title="Entretenimiento"
          icon="IconMovie"
          color={150}
          checked={true}
        />
      </div>
      <div className="tag-form__tags">
        <p>Personales</p>
        <Tag title="" icon="" color={0} checked={false} />
        <Tag title="" icon="" color={0} checked={false} />
        <Tag title="" icon="" color={0} checked={false} />
        <Tag title="" icon="" color={0} checked={false} />
      </div>
    </div>
  );
}
