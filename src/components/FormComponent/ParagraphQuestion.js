const ParagraphQuestion = ({ question, itemId }) => (
  <div>
    <label>{question.title}</label>
    <textarea name={itemId} placeholder="Your detailed response"></textarea>
  </div>
);

export default ParagraphQuestion;
