import { QUESTION_STYLES } from "@/lib/caspian/question-styles";

export function Overview() {
  return (
    <div className="overview">
      <h2>Типы вопросов</h2>
      <p>
        Не самодельная классификация. Приёмы взятия из пособий, по которым
        этому учат: Поташев «Почему вы проигрываете в ЧГК?», Вашкулат
        «Методическое пособие для тех, кто хочет тренироваться в спортивное
        ЧГК», Выменец «К вопросу о классификации вопросов», учебник Клюки и
        Губича. Либер ещё в 1994-м писал, что любая раскладка произвольна —
        ниже не «единственно верные типы», а рабочие ходы. Примеры — из этих
        же текстов, не из пакета.
      </p>
      <p>
        Свёрнуто имя и опознавательный знак. На одном вопросе ходов может быть
        несколько; форму держат всегда.
      </p>

      <ol className="style-list">
        {QUESTION_STYLES.map((style, index) => (
          <li key={style.id}>
            <details className="style-item">
              <summary>
                <span className="style-num">{index + 1}</span>
                <strong>{style.id}</strong>
                <span className="style-see">{style.see}</span>
              </summary>
              <p className="style-src">{style.source}</p>
              {style.body.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
              <div className="style-ex">
                <p className="style-prompt">{style.prompt}</p>
                <p className="style-answer">
                  <strong>Ответ.</strong> {style.answer}
                </p>
                <p className="style-why">{style.why}</p>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
