{Object.keys(data).map((q) => (
            <div className="question-container" key={q.id}>
              <h4>{q.title+" "+q.question} ({q.type})</h4><p>{q.questionId}</p>
              {q.type === 'SHORT_ANSWER' && (
                <ul className="answer-options">
                  <li className="option-input">
                    <input type="text" name={`${q.title}.answers[]`} placeholder="Possible answer 1" required/>
                    <input type="range" data-target-name={`${q.title}.chances[]`} value="100" min="0" max="100"required/>
                    <input type="hidden" name={`${q.title}.chances[]`} value="100" min="0" max="100" required/>
                    <p>100.00</p>
                  </li>
                </ul>
              )}
              {q.type === 'PARAGRAPH' && (
                <ul className="answer-options">
                  <li className="option-input">
                    <textarea
                      name={`${q.title}.answers[]`}
                      rows="3"
                      placeholder="Possible answer 1"
                      required  
                    ></textarea>
                    <input
                      type="number"
                      data-target-name={`${q.title}.chances[]`}
                      value="100"
                      min="0"
                      max="100"
                      placeholder="% chance"
                      required
                    />
                    <input
                      type="hidden"
                      name={`${q.title}.chances[]`}
                      value="100"
                      min="0"
                      max="100"
                      required
                    />
                    <button type="button" className="remove-option" style={{ display: 'none' }}>
                      ×
                    </button>
                    <p>100.00</p>
                  </li>
                </ul>
              )}
              {q.type === 'MULTIPLE_CHOICE' && (
                <ul className="answer-options">
                  {q.options.map((option, index) => (
                    <li key={index}>
                      <label>{option}</label>
                      <input type="hidden" name={`${q.title}.answers[]`} value={option} />
                      <input
                        type="number"
                        data-order={index}
                        data-target-name={`${q.title}.chances[]`}
                        value="0"
                        min="0"
                        max="100"
                        placeholder="% chance"
                        required
                      />
                      <input
                        type="hidden"
                        name={`${q.title}.chances[]`}
                        value="0"
                        min="0"
                        max="100"
                        required
                      />
                      <p>0.00</p>
                    </li>
                  ))}
                </ul>
              )}
              {q.type === 'CHECKBOX' && (
                <>
                  <input type="hidden" name={`${q.title}_isMultipleChoice[]`} value="true" />
                  <ul className="answer-options">
                    {q.options.map((option, index) => (
                      <li key={index}>
                        <label>{option.value}</label>
                        <input type="hidden" name={`${q.title}.answers[]`} value={option} />
                        <input
                          type="number"
                          data-order={index}
                          data-target-name={`${q.title}.chances[]`}
                          value="100"
                          min="0"
                          max="100"
                          placeholder="% chance"
                          required
                        />
                        <input
                          type="hidden"
                          name={`${q.title}.chances[]`}
                          value="100"
                          min="0"
                          max="100"
                          required
                        />
                        <p>100.00</p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {q.type === 'DROP-DOWN' && (
                <ul className="answer-options">
                  {q.options.map((option, index) => (
                    <li key={index}>
                      <label>{option}:</label>
                      <input type="hidden" name={`${q.title}.answers[]`} value={option} />
                      <input
                        type="number"
                        data-order={index}
                        data-target-name={`${q.title}.chances[]`}
                        value="0"
                        min="0"
                        max="100"
                        placeholder="% chance"
                        required
                      />
                      <input
                        type="hidden"
                        name={`${q.title}.chances[]`}
                        value="0"
                        min="0"
                        max="100"
                        required
                      />
                      <p>0.00</p>
                    </li>
                  ))}
                </ul>
              )}
              {q.type === 'LINEAR_SCALE' && (
                <ul className="answer-options">
                  {q.scale.options.map((option, index) => (
                    <li key={index}>
                      <label htmlFor={`${q.title}_opt_${index}`}>{option}</label>
                      <input type="hidden" name={`${q.title}.answers[]`} value={option} />
                      <input
                        type="number"
                        data-order={index}
                        data-target-name={`${q.title}.chances[]`}
                        value="0"
                        min="0"
                        max="100"
                        placeholder="% chance"
                        required
                      />
                      <input
                        type="hidden"
                        name={`${q.title}.chances[]`}
                        value="0"
                        min="0"
                        max="100"
                        required
                      />
                      <p>0.00</p>
                    </li>
                  ))}
                </ul>
              )}
              {q.type === 'MULTIPLE_CHOICE' && (
                <button type="button" onClick={() => handleAddOption(q.title)}>
                  + Add Other Option
                </button>
              )}

              <div className="chance-total" data-question={q.title}>
                Total: 0%
              </div>
              <hr />
            </div>
          ))}