// FAQ question/answer pairs, extracted verbatim from the mirrored
// /strona-glowna/faq page content — used to build FAQPage JSON-LD structured
// data (Google shows these directly as an expandable rich result in search).
// Kept as a separate data file rather than re-parsing the mirrored HTML at
// request time since this content is frozen (client not editing the FAQ).
export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Czy opłaty za kurs muszę dokonać od razu przy zakupie? Czy konieczna jest wpłata za cały kurs?",
    answer: "Nie, zakup kursu nie wiąże się z obowiązkiem zapłaty i do momentu zapłacenia zaliczki jest traktowany jak wstępne zgłoszenie. Wszelkie instrukcje dotyczące płatności są zawarte w mailu, który otrzymasz od razu po rezerwacji miejsca na kursie.",
  },
  {
    question: "Jestem mamą karmiącą. Czy mogę zabrać dziecko ze sobą na kurs?",
    answer: "Zachęcamy mamy karmiące do realizowania karmienia na żądanie. Jednak sprawowanie osobistej opieki nad niemowlęciem podczas kursu może być zbyt obciążające dla uczestniczki, która powinna być możliwie najbardziej skupiona na treściach kursu. Dlatego konieczne będzie wsparcie dodatkowej osoby, która zajmie się maluszkiem podczas gdy jego mama będzie ćwiczyć wiązania na kursie.",
  },
  {
    question: "Czy płatność za kurs można rozbić na raty?",
    answer: "Płatności należy dokonać w dwóch częściach - zaliczka 600 zł po zgłoszeniu, która rezerwuje miejsce na kursie, i pozostała kwota 1900 zł płatna do dwóch tygodni przed kursem. Możliwe jest jednak opłacenie kursu w terminach niestandardowych, każdorazowo jest to ustalane indywidualnie, zapytaj!",
  },
  {
    question: "Czy konieczne jest ukończenie kursu zaawansowanego?",
    answer: "Nie. Kurs zaawansowany jest szkoleniem dla chętnych, którzy chcą w sposób usystematyzowany poszerzać swoje kompetencje. Opanowanie treści kursu podstawowego wystarcza, aby w sposób prawidłowy i satysfakcjonujący pracować z rodzicami w charakterze doradcy noszenia.",
  },
  {
    question: "Dlaczego zaświadczenie o ukończeniu kursu ważne jest tylko dwa lata?",
    answer: "Wiedza idzie do przodu, doradca powinien być na bieżąco. Szkoła chce też mieć pewność, że rekomenduje doradców pracujących zgodnie ze standardami szkoły. To dlatego raz na dwa lata doradca jest zobligowany do wzięcia udziału w refreshu, jednodniowym spotkaniu, które pozwala odświeżyć kompetencje i wymienić doświadczenia z innymi doradcami.",
  },
  {
    question: "Jestem młodą mamą, pasjonatką noszenia. Mam spryt do wiązania, ale nie mam wiedzy dotyczącej anatomii, czy to nie przeszkoda?",
    answer: "To wspaniałe, że chcesz dzielić się swoją pasją z innymi młodymi mamami! Na kursie będziesz mogła zweryfikować swoje techniki wiązania tak, aby stały się one bardziej uniwersalne. Poznasz też w wystarczającym stopniu podstawy anatomii, a także fizjologii i rozwoju dziecka. Otrzymasz listę lektur i wsparcie grupy doradców!",
  },
  {
    question: "Wykonuję zawód medyczny, znajomość technik wiązania chusty przyda mi się w pracy zawodowej, ale nigdy jeszcze nie dotykałam chusty. Czy dam radę nauczyć się technik wiązania przez trzy dni?",
    answer: "Przez trzy dni nie osiągniesz biegłości w wiązaniu, ale poznasz mechanikę chusty, wielokrotnie wiążąc zautomatyzujesz większość ruchów, pod czujnym okiem trenera wyeliminujesz większość błędów i otrzymasz wskazówki, w jaki sposób dalej ćwiczyć. Możesz brać udział w refreshach - nawet od razu po kursie.",
  },
  {
    question: "Chcę skorzystać z dofinansowania, czy jest taka możliwość?",
    answer: "Tak, firma znajduje się w Rejestrze Firm Szkoleniowych, kilka udanych dofinansowanych kursów/szkoleń za nami. Najważniejsze jednak - wszystkie procedury urzędowe muszą być zakończone na co najmniej tydzień przed rozpoczęciem kursu. Możliwe jest też finansowanie z BUR, ale ta możliwość ograniczona jest do kursów odbywających się w Lublinie.",
  },
];
