/**
 * CARTA X — «Noticias desde El Nilo»
 * Generado por scripts/build_book.py
 *
 * Texto: DOCX de Selección Cartas, con la redacción final del PDF aplicada.
 * Paginación: calcada del PDF (CartasNilo_10.pdf, págs. 1–3).
 * Notas: todas las del aparato editorial. Las que no entraron en la
 *        maquetación impresa llevan inPrint: false.
 */

export const meta10 = {
  id:         'carta-10',
  number:     "X",
  title:      "A su madre",
  place:      "Tebas, amarrados a orillas de Luxor, 3 de mayo de 1850",
  firstPage:  1,
};

export const footnotes10 = {
  1: { text: "Erigida a 800 km del Mediterráneo, en la orilla derecha del Nilo, cerca de las rutas que conducen a Nubia y al mar Rojo, Tebas (el nombre griego de la antigua Uaset) fue la capital de Egipto durante los imperios Medio y Nuevo (2050 a. C. - 1070 a. C.). Su pasado esplendor se refleja en las monumentales ruinas de Karnak y Luxor, y, en la orilla izquierda, en las necrópolis de Biban El-Moluk (Valle de los Reyes) y Qurna, y los palacios y templos de Deir El-Bahari y Medinet Habu. Luxor, el nombre de la ciudad actual, abriga los yacimientos arqueológicos de la antigua Tebas." },
  2: { text: "Paraje arqueológico de la antigua ciudad de Tebas. Alberga el colosal templo del mismo nombre, construido durante el Imperio Nuevo ([em:véase la nota anterior])." },
  3: { text: "[em:Véase nota 33 de la Carta VI", inPrint: false },
  4: { text: "Servicio de correo urgente que se hacía con jinetes a caballo y un sistema de postas. La figura más popular de esta modalidad de mensajería fue el [em:Pony Express] de Estados Unidos.", image: "/images/c10-nota-04.jpg", caption: "Lloyd Branson (1853-1925), Jinete del Pony Express (1904).", inPrint: false },
  5: { text: "[em:Véase nota 6 de la Carta V", inPrint: false },
  6: { text: "Se refiere a la Carta IX, fechada el 22 de abril, pero sin indicación de lugar. Probablemente la escribió en Edfú, donde atracaron al anochecer de ese día. Sin embargo, la misiva se expidió en Esna, a la que arribaron el 26 de abril.", inPrint: false },
  7: { text: "Población situada en la margen izquierda del Nilo y al sur de la vecina Luxor. También se la conoce por los nombres de Ermont, Hermontis y Heliópolis del Sur.", inPrint: false },
};

export const spreads10 = [
  {
    left: {
      pageNumber: '1',
      blocks: [
        { type: 'chapter-header',
          title: "CARTA X",
          dedication: "A su madre",
          location: "Tebas[fn:1], amarrados a orillas de Luxor[fn:2], 3 de mayo de 1850" },
        { type: 'paragraph', dropCap: true, text: "Son las cuatro y media de la madrugada. Me levanto con prisas, querida madre mía, para enviar este [ht:billete] a Quena[fn:3], al agente francés que lo remitirá a El Cairo. He solicitado un jinete de correo exprés[fn:4] para llevarlo y traerme tus cartas, si las hay. ¿Tendré más suerte en Quena de lo que tuve en Asuán? ¡Dios lo quiera!" },
        { type: 'inline-note',
          note: 4,
          title: "Lloyd Branson (1853-1925), Jinete del Pony Express (1904).",
          image: "/images/c10-nota-04.jpg",
          caption: "Lloyd Branson (1853-1925), Jinete del Pony Express (1904)." },
        { type: 'paragraph', text: "Llegamos a Tebas ayer por la noche, a las nueve. Estuvimos paseando por Luxor bajo la luz de la luna. Esta se elevaba tras las hileras de columnas, iluminando las imponentes ruinas. ¡Ah, cuán hermoso es el cielo aquí, madre mía, qué estrellas, qué noche! ¡Aún no hemos visto nada de Tebas, pero debe de ser magnífica! Estaremos aquí unos quince días, imagino, porque es [em:inmensa], y como queremos verlo todo y no acabar deslomados, nos tomaremos nuestro tiempo. Gracias a este sistema, ninguno de nosotros ha caído aún víctima del agotamiento. Preveo que no llegaremos a Jerusalén antes del 1 o el 15 de julio, probablemente, y a Constantinopla no antes de octubre o noviembre; por lo demás, resulta imposible precisar nada con antelación. Lo único cierto es que el próximo invierno, en enero o febrero, verás a tu pobre [ht:fíu]. Ten paciencia, pobre madre mía; el tiempo pasa, ya estamos a la mitad. La segunda mitad pasará más rápidamente que la primera. ¡Tendremos tanto de qué charlar sentados en nuestros sillones junto al fuego!" },
      ],
    },
    right: {
      pageNumber: '2',
      blocks: [
        { type: 'paragraph', text: "Desde mi última carta de Esna[fn:5], enviada el 26 de abril[fn:6], no tengo nada nuevo que contarte, excepto que tengo los dedos ennegrecidos de nitrato de plata, por haber ayudado a mi socio, ayer, en Armant[fn:7], en sus labores fotográficas. Ha crecido en él una pasión por la natación que podría haber acabado fatal, si no le hubiéramos rogado que la abandonara. Se tiraba al Nilo, en medio del río, sin tener en cuenta que hay muchos cocodrilos; no obstante, tras nuestras reprimendas, ha dejado de hacerlo. ¡Es un bribón de cuidado! ¡Nuestra salud sigue siendo estupenda y nuestros rostros tienen cada vez más el color de las pipas curadas!" },
        { type: 'paragraph', text: "Adiós, pobre madre mía querida; solo me queda tiempo para abrazarte con todo mi corazón. Tuyo." },
      ],
    },
  },
  {
    left: {
      pageNumber: '3',
      blocks: [
        { type: 'full-note',
          title: "Armant",
          blocks: [
            { type: 'note-image', src: "/images/c10-completa-03.jpg", caption: "Maxime Du Camp, Ruinas del templo de Armant." },
            { type: 'note-paragraph', text: "Población cercana a Luxor, situada en la margen izquierda del Nilo. También se la conoce por los nombres de Ermont, Hermontis y Heliópolis del Sur." },
          ] },
      ],
    },
    right: { blocks: [] },
  },
];
