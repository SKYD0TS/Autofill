const LinearScaleQuestion = ({ question, itemId }) => (
  <div>
    <label>{question.title}</label>
    <input type="range" name={itemId} min={question.scaleQuestion.low} max={question.scaleQuestion.high} />
    <p>{question.scaleQuestion.lowLabel} - {question.scaleQuestion.highLabel}</p>
  </div>
);

export default LinearScaleQuestion;
