const CheckboxQuestion = ({ question, itemId }) => (
  <div>
    <label>{question.title}</label>
    {question.choiceQuestion.options.map((option, index) => (
      <div key={index}>
        <input type="checkbox" name={itemId} value={option.value} /> {option.value}
        <label>Probability</label>
        <input type="number" name={`probability-${option.value}`} min="0" max="100" placeholder="0-100%" />
        {option.isOther && (
          <div>
            <input type="checkbox" name={itemId} value="Other" /> Other: 
            <input type="text" name={`other-${itemId}`} placeholder="Other option" />
            <label>Probability</label>
            <input type="number" name={`probability-other-${itemId}`} min="0" max="100" placeholder="0-100%" />
          </div>
        )}
      </div>
    ))}
  </div>
);

export default CheckboxQuestion;