export default function MultipleChoiceQuestion({ question, itemId }) {
    return (
        <div>
            <label>{question.title}</label>
            <div className="rating">
                {[...Array(question.ratingQuestion.ratingScaleLevel)].map((_, index) => (
                    <div key={index}>
                        <input type="radio" name={itemId} value={index + 1} id={`star${index + 1}`} />
                        <label htmlFor={`star${index + 1}`}>★</label>
                    </div>
                ))}
            </div>
        </div>
    )
}
