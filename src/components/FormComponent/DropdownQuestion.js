const DropdownQuestion = ({ question, itemId }) => (
  <div>
    <label>{question.title}</label>
    <select name={itemId}>
      {question.choiceQuestion.options.map((option, index) => (
        <option key={index} value={option.value}>{option.value}</option>
      ))}
      {question.choiceQuestion.options.some(option => option.isOther) && (
        <div>
          <option value="Other">Other</option>
          <input type="text" name={`other-${itemId}`} placeholder="Other option" />
          <label>Probability</label>
          <input type="number" name={`probability-other-${itemId}`} min="0" max="100" placeholder="0-100%" />
        </div>
      )}
    </select>
  </div>
);

export default DropdownQuestion;
