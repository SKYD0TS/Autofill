import { useForm, useFieldArray } from "react-hook-form";

function DynamicForm() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      contacts: [{ phone: "" }], // Initial field
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts", // Name of the array field
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input
            {...register(`contacts.${index}.phone`)}
            placeholder="Phone Number"
          />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ phone: "" })} // Add new field
      >
        Add Phone Number
      </button>
      <button type="submit">Submit</button>
    </form>
  );
}