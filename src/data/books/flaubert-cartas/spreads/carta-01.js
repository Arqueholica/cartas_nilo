/**
 * CARTA I — «Noticias desde El Nilo»
 * Generado por scripts/build_book.py
 *
 * Texto: DOCX de Selección Cartas, con la redacción final del PDF aplicada.
 * Paginación: calcada del PDF (CartasNilo_1-5.pdf, págs. 7–8).
 * Notas: todas las del aparato editorial. Las que no entraron en la
 *        maquetación impresa llevan inPrint: false.
 */

export const meta01 = {
  id:         'carta-01',
  number:     "I",
  title:      "A Emmanuel Vasse",
  place:      "El Cairo, 17 de enero de 1850",
  firstPage:  7,
};

export const footnotes01 = {
  1: { text: "Emmanuel Vasse de Saint Ouen, amigo de Flaubert desde su ingreso en el [em:Collège] (instituto, centro de enseñanza media) de Ruan, en 1832. Las madres de ambos estudiantes eran también viejas amigas.", inPrint: false },
  2: { text: "Región histórica comprendida entre la primera catarata del Nilo, en Asuán, y la confluencia del Nilo Azul y con el Nilo Blanco en Jartum, en Sudán. Fue el territorio del reino de Kush, temido y codiciado por los faraones." },
  3: { text: "El escritor hace referencia a una carta de noviembre en la que su madre le comentaba que Vasse estaba escribiendo un libro, inspirado probablemente en Oriente o en Creta (véase nota 7 de la Carta XII)." },
  4: { text: "Finalmente, Flaubert y Du Camp no llegaron a Jerusalén por la península del Sinaí, sino por mar: de Alejandría a Beirut. Tampoco visitaron Bagdad ni viajaron a Persia. En la Carta XI, fechada el 16 de mayo de 1850, el escritor explicará a su madre los motivos del cambio de rumbo en relación con los planes previstos inicialmente." },
  5: { text: "Actualmente es la ciudad turca de Birecik, situada a orillas del río Éufrates. También se la conoció por los nombres de Birtha (en griego y latín), Al-Birah (en árabe), Bir, Bilé, Biré y Biradjik. En el texto original en francés, Flaubert se refiere a ella indistintamente como Biredjik y Bir.", image: "/images/c01-nota-05.jpg", caption: "André Slom (1844-1909), Biredjik y el Éufrates, a partir de una fotografía del capitán Barry, miembro de la misión científica de Ernest Chantre, subdirector del Museo de Lyon (1881)." },
  6: { text: "Éufrates." },
};

export const spreads01 = [
  {
    left: {
      pageNumber: '7',
      blocks: [
        { type: 'chapter-header',
          title: "CARTA I",
          dedication: "A Emmanuel Vasse[fn:1]",
          location: "El Cairo, 17 de enero de 1850" },
        { type: 'paragraph', dropCap: true, text: "Seguro que te sorprendes, amigo mío, al leer el matasellos del sobre que acabas de abrir. Estoy en Egipto desde hace dos meses; este es el comienzo de un gran viaje en el que recorreré Siria, Persia y el Asia Menor. Estaré de vuelta en Francia en la primavera de 1851." },
        { type: 'paragraph', text: "En pocos días salgo hacia Nubia[fn:2] y no quiero dejar pasar más tiempo sin agradecerte tu envío, que, por otra parte, aún no he podido abrir. Tu carta, con fecha del 11 de noviembre, me llegó justo ayer. Mi madre, aún más que tú, se niega a darme el título de tu obra[fn:3], que tanto querría conocer." },
        { type: 'paragraph', text: "Me fui de París sin tiempo para despedirme de ti. Una mañana pasé por el ministerio; pregunté por ti, no estabas." },
        { type: 'paragraph', text: "Este es nuestro itinerario: en abril estaremos (viajo con Du Camp) de vuelta aquí. Desde aquí iremos a Jerusalén por el Sinaí y Áqaba[fn:4]; de Jerusalén a Damasco, Antioquía, Beirut y Alepo; de Alepo a Biradjik[fn:5]; de Bir a Bagdad; descenso por el río[fn:6], Basora, Shustar, Persépolis, Isfahán y Teherán; regreso por el Cáucaso y Constantinopla (y quizá Grecia). Si tienes alguna información que darme sobre cualquiera de estos lugares, un detalle que aclarar, cualquier encargo, me ocuparé con sumo gusto. Escríbeme, si tienes tiempo o ganas, cuanto quieras. Por mi parte, no te prometo nada, pues apenas me queda tiempo, por la noche, de tomar mis notas. Espero que dentro de dos años estemos charlando de todo esto en mi casa, junto a la chimenea, fumando las viejas pipas de la amistad." },
        { type: 'inline-note',
          note: 5,
          title: "André Slom (1844-1909), Biredjik y el Éufrates, a partir de una fotografía…",
          image: "/images/c01-nota-05.jpg",
          caption: "André Slom (1844-1909), Biredjik y el Éufrates, a partir de una fotografía del capitán Barry, miembro de la misión científica de Ernest Chantre, subdirector del Museo de Lyon (1881)." },
      ],
    },
    right: {
      pageNumber: '8',
      blocks: [
        { type: 'paragraph', text: "Puedes escribirme a El Cairo hasta el mes de abril, a Jerusalén hacia el mes de mayo, a Bagdad en julio." },
        { type: 'paragraph', text: "Adiós, cuídate mucho, dale brega. Un fuerte apretón de manos." },
        { type: 'paragraph', text: "Tuyo." },
      ],
    },
  },
];
