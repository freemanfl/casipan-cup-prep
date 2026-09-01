import { QUESTION_STYLES } from "@/lib/caspian/question-styles";

const EDS = [
  "Мерзляков",
  "Моносов",
  "Борок",
  "Абрамов",
  "Науменко",
  "Миротин",
];

const COUNTS = [1340, 1263, 1207, 1140, 886, 873];
const MAX = COUNTS[0];

const ASK = {
  direct: [47.8, 51.0, 56.7, 59.5, 61.1, 56.2],
  hidden: [29.9, 28.5, 22.8, 22.8, 15.2, 23.0],
  form: [10.9, 9.2, 8.7, 9.8, 13.2, 9.5],
  handout: [7.3, 7.0, 6.5, 5.2, 5.6, 6.3],
  rest: [4.1, 4.3, 5.3, 2.7, 4.8, 5.0],
};

const THEMES = {
  literature: [41, 30, 32, 26, 24, 30],
  history: [21, 18, 23, 19, 20, 23],
  cinema: [13, 14, 12, 15, 20, 16],
  science: [12, 14, 7, 11, 7, 8],
};

const SEG = {
  direct: "#075985",
  hidden: "#0284c7",
  form: "#38bdf8",
  handout: "#7dd3fc",
  rest: "#1e3a5f",
};

const THEME_COLORS = {
  literature: "#075985",
  history: "#0369a1",
  cinema: "#38bdf8",
  science: "#7dd3fc",
};

function pct(value: number): string {
  return `${value}%`;
}

export function Overview() {
  return (
    <div className="overview">
      <h2>Типы вопросов</h2>
      <p>
        Сначала как устроен, потом о чём. Иди сверху вниз, остановись на первом
        совпадении. Типов на одном вопросе может быть несколько.
      </p>

      <ol className="style-list">
        {QUESTION_STYLES.map((style, index) => (
          <li key={style.id}>
            <p className="style-head">
              <span className="style-num">{index + 1}</span>
              <strong>{style.id}</strong>
              <span className="style-see">{style.see}</span>
            </p>
            <p className="style-do">{style.do}</p>
            <p className="style-ex">{style.example}</p>
          </li>
        ))}
      </ol>

      <h2>Как готовиться</h2>
      <p>
        Не зубрить семь тысяч разовых фактов. Почти всё встречается один раз.
        Имеет смысл три вещи.
      </p>
      <ol>
        <li>
          То, что всплывает у нескольких редакторов: Холмс, Гамлет, Пушкин,
          Набоков, Архимед, Ньютон, Лютер, Дали, Македонский, Кэрролл. Это не
          ответы на конкретные вопросы, а сюжеты, которые они все любят.
        </li>
        <li>
          Как они прячут ответ. У Мерзлякова и Моносова — подставить слово
          вместо «ИКСа» или вернуть букву в цитате. У Науменко — знать и попасть
          в форму: два слова, одна буква.
        </li>
        <li>
          О чём кто спрашивает. Мерзляков — книги. Моносов — наука и буква в
          тексте. Борок — техника и каламбур. Науменко — кино. Миротин — мифы и
          искусство.
        </li>
      </ol>

      <div className="overview-stats">
        <div className="overview-stat">
          <strong>6709</strong>
          <span>вопросов</span>
        </div>
        <div className="overview-stat">
          <strong>70%</strong>
          <span>нужно просто знать</span>
        </div>
        <div className="overview-stat">
          <strong>7011</strong>
          <span>разных фактов</span>
        </div>
        <div className="overview-stat">
          <strong>90%</strong>
          <span>фактов встречаются один раз</span>
        </div>
      </div>

      <h2>Сколько вопросов у кого</h2>
      <p>
        Мерзляков, Моносов, Борок и Абрамов — основная часть. У Науменко и
        Миротина вопросов меньше.
      </p>
      <div className="bar-list">
        {EDS.map((name, index) => (
          <div className="bar-row" key={name}>
            <span>{name}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: pct((COUNTS[index] / MAX) * 100) }}
              />
            </div>
            <span>{COUNTS[index]}</span>
          </div>
        ))}
      </div>

      <h2>Как задают вопрос</h2>
      <p>
        Больше половины вопросов прямые: либо знаешь, либо нет. Ещё четверть
        прячет ответ за «ИКСом» или «ОНА» — подставляешь слово, и фраза
        складывается. Намёки, спрятанные цитаты и параллели вместе меньше 3%.
        Догадаться без знания почти нельзя: так устроены только 6 вопросов из
        6709.
      </p>
      <div className="legend">
        <span>
          <i style={{ background: SEG.direct }} /> спрашивают прямо
        </span>
        <span>
          <i style={{ background: SEG.hidden }} /> прячут слово (ИКС, ОНА)
        </span>
        <span>
          <i style={{ background: SEG.form }} /> задана форма ответа
        </span>
        <span>
          <i style={{ background: SEG.handout }} /> есть раздатка
        </span>
        <span>
          <i style={{ background: SEG.rest }} /> остальное
        </span>
      </div>
      <div className="bar-list">
        {EDS.map((name, index) => (
          <div className="stack-row" key={name}>
            <span>{name}</span>
            <div className="stack-track">
              <div
                className="stack-seg"
                style={{ width: pct(ASK.direct[index]), background: SEG.direct }}
              />
              <div
                className="stack-seg"
                style={{ width: pct(ASK.hidden[index]), background: SEG.hidden }}
              />
              <div
                className="stack-seg"
                style={{ width: pct(ASK.form[index]), background: SEG.form }}
              />
              <div
                className="stack-seg"
                style={{
                  width: pct(ASK.handout[index]),
                  background: SEG.handout,
                }}
              />
              <div
                className="stack-seg"
                style={{ width: pct(ASK.rest[index]), background: SEG.rest }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="overview-note">
        «Остальное» — подмена буквы в цитате, намёк, параллель.
      </p>

      <h3>Знание или ещё и догадка</h3>
      <div className="pie-wrap">
        <div className="pie" aria-hidden="true" />
        <div>
          <p>нужно знать — 4699</p>
          <p>знать и догадаться — 2004</p>
          <p>только логика — 6</p>
          <p className="overview-note">
            «Знать и догадаться» — почти всегда вопрос с «ИКСом» или подменой
            буквы.
          </p>
        </div>
      </div>

      <h2>О чём спрашивают</h2>
      <p>
        Чаще всего — книги. Исключение — Науменко: у него кино почти наравне с
        литературой. Мерзляков самый книжный: 41% его вопросов про литературу.
        Моносов чаще уходит в науку, Борок — в технику, Миротин — в мифы.
      </p>
      <div className="legend">
        <span>
          <i style={{ background: THEME_COLORS.literature }} /> литература
        </span>
        <span>
          <i style={{ background: THEME_COLORS.history }} /> история
        </span>
        <span>
          <i style={{ background: THEME_COLORS.cinema }} /> кино
        </span>
        <span>
          <i style={{ background: THEME_COLORS.science }} /> наука
        </span>
      </div>
      <div className="bar-list">
        {EDS.map((name, index) => (
          <div className="stack-row" key={name}>
            <span>{name}</span>
            <div className="stack-track">
              <div
                className="stack-seg"
                style={{
                  width: pct(THEMES.literature[index]),
                  background: THEME_COLORS.literature,
                }}
              />
              <div
                className="stack-seg"
                style={{
                  width: pct(THEMES.history[index]),
                  background: THEME_COLORS.history,
                }}
              />
              <div
                className="stack-seg"
                style={{
                  width: pct(THEMES.cinema[index]),
                  background: THEME_COLORS.cinema,
                }}
              />
              <div
                className="stack-seg"
                style={{
                  width: pct(THEMES.science[index]),
                  background: THEME_COLORS.science,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="overview-note">
        Доля вопросов, где эта тема есть. Сумма больше 100%, потому что у одного
        вопроса бывает несколько тем — полоски обрезаны по первым четырём.
      </p>

      <h2>Что повторяется у разных редакторов</h2>
      <p>
        Имени, которое было бы у всех шестерых, нет. Зато 79 вещей встречаются
        хотя бы у троих. Это и есть короткий список на чтение: школьные и
        общеизвестные сюжеты, а не разовые курьёзы одного пакета.
      </p>
      <div className="overview-table-wrap">
        <table className="overview-table">
          <thead>
            <tr>
              <th>О чём вопрос</th>
              <th>Сколько раз</th>
              <th>У скольких редакторов</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Шерлок Холмс", "8", "4"],
              ["Мартин Лютер", "7", "5"],
              ["Архимед", "7", "4"],
              ["Владимир Набоков", "6", "4"],
              ["Москва", "5", "4"],
              ["Зигмунд Фрейд", "5", "3"],
              ["Гамлет", "4", "3"],
              ["Александр Македонский", "4", "4"],
              ["Сальвадор Дали", "4", "4"],
              ["Прометей", "4", "4"],
              ["Пушкин", "4", "3"],
              ["Исаак Ньютон", "4", "3"],
              ["Льюис Кэрролл", "4", "3"],
              ["451 градус по Фаренгейту", "4", "3"],
              ["Шалтай-Болтай", "4", "3"],
            ].map(([name, times, editors]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{times}</td>
                <td>{editors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="overview-note">
        Рядом ещё: Титаник, Пизанская башня, Мюнхгаузен, Маяковский, Бэнкси,
        «Крик», танго, подкова.
      </p>

      <h2>Как пишет каждый</h2>
      <div className="overview-grid">
        <article className="overview-card">
          <h3>Максим Мерзляков · 1340 вопросов</h3>
          <p>
            Самый книжный и чаще всех прячет ответ за «ИКСом»: 41% про
            литературу, почти треть вопросов с подстановкой слова. Часто ещё
            требует ответ в заданной форме — два слова, одна буква. Имеет смысл
            читать Борхеса, Диккенса, классику, плюс редкую биологию и языки.
          </p>
          <p className="overview-note">
            Часто всплывает: Моби Дик, Харон, Гретна-Грин
          </p>
        </article>
        <article className="overview-card">
          <h3>Борис Моносов · 1263 вопроса</h3>
          <p>
            Тоже любит спрятать слово, но чаще подменяет букву в уже написанной
            фразе (так устроены 9% его вопросов). Науки больше, чем у остальных.
            Имеет смысл читать Набокова, Хокинга, Уэллса, путешественников.
          </p>
          <p className="overview-note">
            Часто всплывает: Орсон Уэллс, Рубцов, Миклухо-Маклай, гелий
          </p>
        </article>
        <article className="overview-card">
          <h3>Дмитрий Борок · 1207 вопросов</h3>
          <p>
            Спрашивает прямее Мерзлякова, но любит игру со словом: палиндром,
            компьютерная мышь, шарманка. Больше техники и намёков. История почти
            наравне с литературой.
          </p>
          <p className="overview-note">
            Часто всплывает: палиндром, компьютерная мышь, Холмс, Троянский конь
          </p>
        </article>
        <article className="overview-card">
          <h3>Андрей Абрамов · 1140 вопросов</h3>
          <p>
            Ровнее и прямее: 59% вопросов без пряток. Европейские сюжеты и
            имена. Кино и наука без перекоса в одну сторону.
          </p>
          <p className="overview-note">
            Часто всплывает: Пиноккио, Дон Жуан, Меркурий, Архимед
          </p>
        </article>
        <article className="overview-card">
          <h3>Константин Науменко · 886 вопросов</h3>
          <p>
            Самый прямой: 61% без «ИКСа», 80% достаточно просто знать. Кино
            стоит рядом с литературой. Чаще просит ответ в форме — два слова или
            определённая буква, а не подстановку в предложение.
          </p>
          <p className="overview-note">
            Часто всплывает: Золушка, Ной, Лэнс Армстронг, Дисней
          </p>
        </article>
        <article className="overview-card">
          <h3>Евгений Миротин · 873 вопроса</h3>
          <p>
            Пишет близко к среднему, чуть больше мифов и искусства. Психоанализ,
            танец, античность. Пакетов меньше, чем у первой четвёрки — каждый
            вопрос весит больше.
          </p>
          <p className="overview-note">
            Часто всплывает: Фрейд, Айседора Дункан, Хоппер, Адамс
          </p>
        </article>
      </div>

      <p className="overview-note">
        Имена фактов сняты с начала карточки автоматически. Поэтому «Пушкин» и
        «Александр Пушкин» считаются разными, и совпадений в таблице меньше, чем
        заметит человек. Это нижняя оценка общего ядра, не полный учебник.
      </p>
    </div>
  );
}
