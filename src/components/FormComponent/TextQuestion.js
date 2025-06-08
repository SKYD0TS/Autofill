const TextQuestion = ({ question, itemId }) => (
  <div>
    <label>{question.title}</label>
    <input type="text" name={itemId} placeholder="Your answer" />
  </div>
);

export default TextQuestion;
