import Spread from "./spread";
import InlineNote from "./InlineNote";
import nadar_fau from "../../../public/images/nadar-gautier.jpg";
import retrato_pradier from "../../../public/images/retrato-pradier.jpg";
import ten_san_antonio from "../../../public/images/tentaciones-san-antonio.jpg";
import quilleboeuf from "../../../public/images/quilleboeuf.jpg";
import abadia_graville from "../../../public/images/abadia-graville.jpg";
import esna1 from "../../../public/images/esna-1.jpg";
import esna2 from "../../../public/images/esna-2.jpg";
import esna3 from "../../../public/images/esna-3.jpg";
import gerome_almea from "../../../public/images/gerome-almea.jpg";
import khawal_ghawazi from "../../../public/images/khawal-ghawazi.jpg";

const Book = ({ spread, flipping, flipDirection, next, prev }) => {
    return (
        <div className="shell" id="shell">
            <button
                type="button"
                className={`nav nav-p ${spread === 0 ? "off" : ""}`}
                onClick={prev}
            >
                ←
            </button>
            <div className="codex" id="codex">

                {/* SPINE */}
                <div className="spine" />

                {/* SPREADS */}
                <Spread
                    active={spread === 0}
                    flipping={flipping}
                    direction={flipDirection}
                    left={
                        <div className="pg pg-l pg-halftitle">
                            <div className="ht-orn">❧</div>
                            <div className="ht-book">Noticias desde El Nilo</div>
                            <div className="ht-orn2">— ✦ —</div>
                        </div>
                    }
                    right={
                        <div className="pg pg-r">
                            <div className="cover">
                                <div className="orn">❧ ❧ ❧</div>
                                <div className="bk">Noticias desde El Nilo</div>
                                <div className="ct">Carta</div>
                                <div className="num">VI</div>
                                <div className="dv">A Louis Bouilhet</div>
                                <div className="lc">A bordo de nuestra canga, a 12 leguas más allá de Siena (Asuán), a 13 de marzo de 1850</div>
                                <div className="au">Gustave Flaubert</div>
                                <div className="o2">— ✦ —</div>
                                <div className="go" id="startRead">Comenzar lectura →</div>
                            </div>
                        </div>
                    }
                />

                {/* Spread 1: Pages 1-2 */}
                <Spread
                    active={spread === 1}
                    flipping={flipping}
                    direction={flipDirection}
                    left={
                        <div className="pg pg-l">
                            <div className="hdr">
                                <p className="sub">Noticias desde El Nilo · Gustave Flaubert</p>
                                <h1>CARTA VI</h1>
                                <p className="ded">A Louis Bouilhet</p>
                                <p className="loc">A bordo de nuestra canga, a 12 leguas más allá de Siena (Asuán), a 13 de marzo de 1850</p>
                            </div>
                            <p className="bt dc">Dentro de seis o siete horas cruzaremos el trópico de ese viejo tunante de Cáncer<sup
                                className="fn" data-n="1">1</sup>. Ahora mismo hace un calor de 30 grados<sup className="fn" data-n="2">2</sup> a
                                la sombra: vamos descalzos, en mangas de camisa. Te escribo recostado sobre mi diván, acompañado por el
                                ruido de los <span className="ht">tarabuchs</span> de nuestros marineros, que cantan dando palmas. El sol cae a
                                plomo sobre el toldo de nuestra cubierta. El Nilo está plano como un río de acero. Hay grandes palmeras en
                                las orillas. El cielo está completamente azul. ¡Ah, mi querido y viejo amigo, mi amigo del alma!</p>

                            <InlineNote
                                title={
                                    <>
                                        Mapa de África en 1850
                                    </>
                                }
                                img="../../../public/images/mapa-africa-1850.jpg"
                                caption={
                                    <>
                                        Mapa de África en 1850, editado por el reverendo y astrónomo Thomas Milner a partir de los
                                        trabajos del cartógrafo August Petermann (1822-1878).
                                    </>
                                }
                            />
                            <span className="pn">23</span>
                        </div>
                    }
                    right={
                        <div className="pg pg-r">
                            <p className="bt">¿A qué te dedicas, tú, en Ruan? Hace mucho que no recibo cartas tuyas o, mejor dicho, hasta el
                                momento solo he recibido una, con fecha de finales de diciembre y a la cual contesté enseguida. Quizá tenga
                                otra esperándome en El Cairo, o puede que ahora mismo me venga alguna de camino. Mi madre me cuenta que
                                apenas te ve. ¿Y eso por qué? Si eso te resulta demasiado pesado, hazlo un poco por mí e intenta contarme
                                qué ocurre en mi casa, en todos los aspectos posibles. ¿Has estado en París? ¿Has vuelto a casa de
                                Gautier<sup className="fn" data-n="3">3</sup>?, y a Pradier<sup className="fn" data-n="4">4</sup> ¿lo has visto? ¿En
                                qué quedó el viaje a Inglaterra por el cuento chino? A menudo susurro tus versos, ánimo, viejo picarón.
                                Necesito darte ahora mismo una satisfacción tremenda en relación con la palabra «vagabundo» aplicada al
                                Nilo:</p>
                            <div className="verse">
                                Que le Nil vagabond roule sur ses rivages!<sup className="fn" data-n="5">5</sup>
                                <span className="tr">(¡Que el Nilo errante fluya por su litoral!).</span>
                            </div>
                            <p className="bt">No hay designación más justa, más precisa ni más amplia a la vez. Es un río sorprendente y
                                magnífico, que se parece más a un océano que a otra cosa. Los arenales se extienden hasta perderse de vista
                                en sus orillas, surcados por los vientos como en las playas del mar. Esto tiene tales proporciones que no se
                                sabe por qué lado va la corriente, y a menudo cree estar encerrado en un gran lago. ¡Ah! ¡Ojo! Si estás
                                esperando una carta más o menos cabal, te equivocas. Te advierto muy seriamente que mi inteligencia ha
                                declinado mucho.</p>
                            <p className="bt">En lo referente al trabajo, leo todos los días la <em>Odisea</em> en griego. Desde que surcamos
                                el Nilo he devorado cuatro de sus cantos. Como regresaremos por Grecia, espero que me resulte útil.</p>
                            <InlineNote
                                title={
                                    <>
                                        Retratos de Théophile Gautier y James Pradier
                                    </>
                                }
                                img={[nadar_fau, retrato_pradier]}
                                caption={
                                    <>
                                        Nadar: <em>Théophile Gautier</em> (ca. 1866).
                                    </>
                                }
                            />
                            <span className="pn">24</span>
                        </div>
                    }
                />

                {/* Spread 2: Pages 3-4 */}
                <Spread
                    active={spread === 2}
                    flipping={flipping}
                    direction={flipDirection}
                    left={
                        <div className="pg pg-l">
                            <p className="bt dc">Los primeros días me puse a escribir un poco, pero, gracias a Dios, enseguida me di cuenta de
                                que era una estupidez. Más vale ser ojo, sin más. Vivimos, como puedes ver, en una pereza embrutecedora.
                                Pasamos los días echados en nuestros divanes, mirando las cosas pasar: desde los camellos y los rebaños de
                                bueyes del Sennar<sup className="fn" data-n="6">6</sup> hasta las barcas que descienden hacia El Cairo, cargadas
                                de negras<sup className="fn" data-n="7">7</sup> y de colmillos de elefante. Nos hallamos ahora, muy señor<sup
                                    className="fn" data-n="8">8</sup> mío, en un país en el que las mujeres van desnudas y, se puede decir con el
                                poeta que «desnudas como la palma de la mano», pues, por toda vestimenta, solo llevan anillos. He visto
                                hijas de Nubia con collares de piastras de oro que les llegaban hasta los muslos, y con cinturones de perlas
                                de colores sobre su vientre negro. ¡Y su danza!... Pero vayamos por orden.</p>
                            <InlineNote
                                title={
                                    <>
                                        David Roberts: <em>Barco esclavista</em> (1842)
                                    </>
                                }
                                img="../../../public/images/barco-esclavista.jpg"
                                caption={
                                    <>
                                        David Roberts: <em>Barco esclavista. Vista del Nilo con las pirámides de Dahshur y Saqqara</em> (1842).
                                    </>
                                }
                            />
                            <p className="bt">De El Cairo a Beni Suef, nada digno de mención. Tardamos diez días en recorrer esas 25 leguas,
                                por culpa del <span className="ht">khamsin</span> o simún que nos retrasó. Nada de lo que se diga sobre él es
                                exagerado. Es una tempestad de arena que te atrapa. Hay que encerrarse y permanecer sereno. Solo nuestras
                                provisiones lo sufrieron mucho; el polvo se cuela por todas partes, entra incluso en los botes de hojalata
                                sellados a presión.</p>
                            <span className="pn">26</span>
                        </div>
                    }
                    right={
                        <div className="pg pg-r">
                            <p className="bt">El sol, en esos días, tiene la apariencia de un disco de plomo; el cielo empalidece; las barcas
                                giran sobre el Nilo como peonzas. No se ve un pájaro, ni una mosca. Al llegar a Beni Suef, hicimos una
                                excursión de cinco días al lago Moeris<sup className="fn" data-n="9">9</sup>. Pero, como no pudimos llegar hasta
                                el final, volveremos allí cuando regresemos a El Cairo.</p>
                            <p className="bt">En Medinet El-Fayum<sup className="fn" data-n="10">10</sup> nos alojamos en casa de un cristiano de
                                Damasco<sup className="fn" data-n="11">11</sup> que nos brindó hospitalidad. En su casa se alojaba, como
                                comensal habitual, un sacerdote católico.</p>
                            <InlineNote
                                title={
                                    <>
                                        Jean-Léon Gérôme: <em>Vista de Medinet El-Fayum</em> (1868)
                                    </>
                                }
                                img="../../../public/images/medinet-el-fayum.jpg"
                                caption={
                                    <>
                                        Jean-Léon Gérôme: <em>Vista de Medinet El-Fayum</em> (1868). Capital de la región del
                                        Fayum, a 130 km al suroeste de El Cairo.
                                    </>
                                }
                            />
                            <p className="bt">So pretexto de que los musulmanes no toman vino, estos buenos cristianos se hinchan de
                                aguardiente. Es increíble la cantidad de vasitos de aguardiente que se soplan por confraternidad religiosa.
                                Nuestro anfitrión era un hombre algo letrado, y, como estábamos en el país de san Antonio, hablamos de él,
                                de Arrio, de san Atanasio<sup className="fn" data-n="12">12</sup>, etc. El buen hombre estaba encantado. ¿Sabes
                                qué colgaba de las paredes de la habitación donde dormimos? ¡Un grabado con una vista de Quilleboeuf<sup
                                    className="fn" data-n="13">13</sup>, y otro con una de la abadía de Graville<sup className="fn"
                                        data-n="14">14</sup>!</p>
                            <InlineNote
                                title={
                                    <>
                                        San Antonio, Quilleboeuf y la abadía de Graville
                                    </>
                                }
                                img={[ten_san_antonio, quilleboeuf, abadia_graville]}
                                caption={
                                    <>
                                        Pieter Brueghel el Joven: <em>Las tentaciones de san Antonio</em>, la pintura que fascinó a
                                        Flaubert en Génova en 1845.
                                    </>
                                }
                            />
                            <span className="pn">27-28</span>
                        </div>
                    }
                />

                {/* Spread 3: Pages 5-6 */}
                <Spread
                    active={spread === 3}
                    flipping={flipping}
                    direction={flipDirection}
                    left={
                        <div className="pg pg-l">
                            <p className="bt dc">Presenciamos, en una región llamada Djebel El-Teir<sup className="fn" data-n="15">15</sup>, una
                                escena bastante divertida. En lo alto de una montaña que domina el Nilo se encuentra un convento de
                                coptos<sup className="fn" data-n="16">16</sup>. Tienen por costumbre, en cuanto divisan una <em>canga</em> con
                                viajeros, descender de su montaña, tirarse al agua y venir nadando a pedir limosna. Es un asalto en toda
                                regla. Ves a esos valientes bajar las afiladas rocas, completamente desnudos, y nadar hacia ti con todas sus
                                fuerzas gritando a pleno pulmón: <em>«¡Batchis, batchis, cawajda chistiani!»</em></p>
                            <InlineNote
                                title={
                                    <>
                                        Monjes coptos (fotografía, 1898-1914)
                                    </>
                                }
                                img="../../../public/images/monjes-coptos.jpg"
                                caption={
                                    <>
                                        Departamento fotográfico de la colonia americana en Jerusalén: <em>Monjes coptos</em> (1898-1914).
                                    </>
                                }
                            />
                            <p className="bt">Los buitres y las águilas sobrevuelan tu cabeza, el barco surca el agua con sus dos grandes
                                velas desplegadas. En aquel momento, uno de nuestros tripulantes bailaba desnudo una danza lasciva. Para
                                ahuyentar a los monjes cristianos, les enseñaba su trasero, mientras ellos se aferraban al costado de la
                                <em>canga</em>. Los otros tripulantes les lanzaban insultos. Joseph les pegaba en la cabeza con las tenazas
                                de la cocina. Era un <span className="ht">tutti</span> de coscorrones, gritos y risas.
                            </p>
                            <p className="bt">En otros lugares no son los hombres quienes vienen a verte, sino los pájaros. En
                                Sheikh-Shaïd<sup className="fn" data-n="17">17</sup> hay un <span className="ht">santon</span> adonde las aves van
                                por sí mismas a depositar la comida que se les da. Nosotros, que hemos leído a Voltaire, no creemos en esas
                                cosas. ¡Pero aquí están tan atrasados! ¡Cantan tan poco a Béranger<sup className="fn" data-n="18">18</sup>!</p>
                            <span className="pn">29-30</span>
                        </div>
                    }
                    right={
                        <div className="pg pg-r">
                            <p className="bt">(¡Cómo puede ser, señor mío, que no se comience a civilizar un poco estos países! ¿El impulso
                                del ferrocarril no se nota allí? ¿Cuál es allí la situación de la instrucción primaria?, etc.). Tanto es así
                                que cuando se pasa por delante de ese <em>santon</em>, todos los pájaros vuelan alrededor del barco y se
                                posan sobre el aparejo… Les echamos migas de pan, se arremolinan en el aire, engullen lo que les hemos
                                arrojado al agua y se vuelven a marchar.</p>
                            <p className="bt">En Quena hice algo decente y que, espero, obtenga tu aprobación. Habíamos puesto pie a tierra
                                para aprovisionarnos, y caminábamos tranquilamente por los bazares, callejeando sin rumbo, respirando el
                                olor a sándalo que nos envolvía, cuando, de repente, al doblar una esquina, acabamos en el barrio de las
                                fulanas. Imagínate, amigo mío, cinco o seis callejuelas sinuosas con chozas de más o menos 4 pies de
                                altura<sup className="fn" data-n="19">19</sup>, hechas de limo gris desecado. En las puertas había mujeres de
                                pie o sentadas sobre esteras. Las negras llevaban vestidos azul cielo, otras iban de amarillo, de blanco, de
                                rojo, con prendas anchas que ondean con el viento caliente. Súmale aromas de especias, y sobre sus pechos
                                descubiertos largos collares de piastras de oro.</p>
                            <p className="bt">Se acercan, te llaman con voces cautivadoras: <em>«Cawadja, cawadja»</em>. Sus dientes blancos
                                relucen bajo los labios rojos y negros, sus ojos de estaño giran como ruedas. Estuve paseándome por aquellos
                                lugares una y otra vez, repartiéndoles <em>batchis</em> a todas. Me abrazaban por la cintura e insistían en
                                arrastrarme adentro de sus casas. ¡Pues bien! Resistí, adrede, por voluntad propia, para conservar la
                                melancolía de esa estampa y hacer que calara en lo más hondo de mí. No hay nada más hermoso que esas mujeres
                                llamándote.</p>
                            <span className="pn">31</span>
                        </div>
                    }
                />

                {/* Spread 4: Pages 7-8 */}
                <Spread
                    active={spread === 4}
                    flipping={flipping}
                    direction={flipDirection}
                    left={
                        <div className="pg pg-l">
                            <p className="bt dc">No siempre me he comportado de acuerdo con este «artisteo» tan estoico: en Esna<sup
                                className="fn" data-n="20">20</sup> estuve en casa de Ruchiuk-Hanem<sup className="fn" data-n="21">21</sup>,
                                celebérrima cortesana. Cuando llegamos a su casa nos estaba esperando. Su confidente había venido esa mañana
                                a la <em>canga</em>, escoltada por un carnero domesticado moteado de alheña amarilla, con un bozal de
                                terciopelo negro, que la seguía como un perro.</p>
                            <InlineNote
                                title={
                                    <>
                                        Esna — Fotografías de Maxime Du Camp
                                    </>
                                }
                                img={[esna1, esna2, esna3]}
                                caption={
                                    <>
                                        Maxime Du Camp: La ciudad de Esna, la antigua Latopolis, a orillas del Nilo. Serie de tres
                                        fotografías.
                                    </>
                                }
                            />
                            <p className="bt">Ella acababa de salir del baño. Con un gran <span className="ht">tarbuch</span>, cuya borla
                                deshilachada le caía sobre sus anchos hombros; la parte inferior de su cuerpo, tapada por unos inmensos
                                pantalones de color rosa; el torso desnudo, cubierto por una gasa violeta, ella se alzaba en lo alto de la
                                escalera, con el sol luciendo a su espalda, y aparecía esplendorosa contra el fondo azul del cielo que la
                                envolvía.</p>
                            <p className="bt">Es una buscona majestuosa, tetuda y carnosa, con la nariz hendida, enormes ojos, magníficas
                                rodillas, y que cuando baila muestra en su vientre unos pliegues de carne de primera. Empezó por perfumarnos
                                las manos con agua de rosas. Hicieron venir a los músicos y hubo danzas<sup className="fn" data-n="22">22</sup>.
                                La suya no vale, ni mucho menos, la del famoso Hassan<sup className="fn" data-n="23">23</sup>, de quien ya te
                                hablé. Sin embargo, resultó bastante agradable. Exceptúo a una nubia que vimos en Asuán<sup className="fn"
                                    data-n="24">24</sup>. Pero eso ya no es danza árabe, es algo más salvaje.</p>

                            <InlineNote
                                title={
                                    <>
                                        Almeas y <em>khawal</em>
                                    </>
                                }
                                img={[gerome_almea, khawal_ghawazi]}
                                caption={
                                    <>
                                        Jean-Léon Gérôme: <em>Muchacha de El Cairo o La almea</em> (1873).
                                    </>
                                }
                            />
                            <span className="pn">33</span>
                        </div>
                    }
                    right={
                        <div className="pg pg-r">
                            <p className="bt">Por la noche volvimos a casa de Ruchiuk-Hanem. Había cuatro mujeres, bailarinas y cantantes,
                                almeas (la palabra «almea» significa sabia, literata; como quien dice puta, lo que demuestra, señor mío,
                                ¡que en todos los países las mujeres de letras!...). La fiesta duró desde las 6 hasta las 10 y ½, incluidas
                                las cópulas durante los entreactos. Dos hombres que tocaban el <span className="ht">rabel</span>, sentados en el
                                suelo, no dejaban de hacer chirriar sus instrumentos. Cuando Ruchiuk se desvistió para bailar, les taparon
                                los ojos con una doblez de sus turbantes, para que no vieran nada. Ese pudor nos desconcertó.</p>
                            <p className="bt">Cuando llegó la hora de irse, no me fui. Ruchiuk apenas se inquietó porque pasáramos la noche
                                con ella. Maxime se quedó solo en un diván, y yo bajé a la planta baja, al dormitorio de Ruchiuk. Una mecha
                                ardía en una lámpara de aspecto antiguo, colgada del muro. En una habitación contigua, los guardas charlaban
                                con la sirvienta, una negra de Abisinia<sup className="fn" data-n="25">25</sup> que tenía en ambos brazos lacras
                                de la peste. Su perrito dormía sobre una chaqueta de seda.</p>
                            <p className="bt">Su cuerpo estaba cubierto de sudor: estaba cansada después de bailar, tenía frío. La tapé con mi
                                pelliza de piel y se quedó dormida. En cuanto a mí, apenas pegué ojo. Pasé la noche entre infinitas
                                intensidades de ensueño. Contemplando a aquella hermosa criatura dormida, que roncaba con la cabeza apoyada
                                sobre su brazo, pensaba en las noches de placer en París, en un montón de viejos recuerdos… y en ella, en su
                                danza, en su voz que entonaba canciones sin significado ni palabras reconocibles para mí.</p>
                            <span className="pn">34</span>
                        </div>
                    }
                />

                {/* Spread 5: Pages 9-10 */}
                <Spread
                    active={spread === 5}
                    flipping={flipping}
                    direction={flipDirection}
                    left={
                        <div className="pg pg-l">
                            <p className="bt dc">Aquello siguió así toda la noche. A las 3 me levanté para salir a la calle; brillaban las
                                estrellas. Ella se despertó, fue a buscar un brasero y durante una hora estuvo calentándose, acurrucada
                                junto a él, luego volvió a acostarse y se durmió de nuevo.</p>
                            <p className="bt">Nos fuimos por la mañana, a las 7. Salí a cazar, con un marinero, por un campo de algodón, bajo
                                las palmeras y los <span className="ht">gazis</span>. La campiña estaba preciosa. Árabes, asnos y búfalos se
                                dirigían a los campos. El viento soplaba entre las finas ramas de los <em>gazis</em>. Aquello producía un
                                silbido parecido al de los juncos. Caminaba arrastrando los pies y pensando en mañanas similares… En una
                                particularmente, en casa del marqués de Pomereu<sup className="fn" data-n="26">26</sup>, en Héron<sup className="fn"
                                    data-n="27">27</sup>, después de un baile. No me había acostado y por la mañana me había ido a pasear en
                                barca por el estanque, completamente solo, con mi uniforme de colegial. Los cisnes me miraban pasar y las
                                hojas de los arbustos caían sobre el agua<sup className="fn" data-n="28">28</sup>. Fue pocos días antes de
                                volver a las clases; tenía quince años.</p>
                            <InlineNote
                                title={
                                    <>
                                        Château de Héron, residencia de los Pomereu
                                    </>
                                }
                                img="../../../public/images/chateau-heron.jpg"
                                caption={
                                    <>
                                        El <em>Château de Héron</em>, propiedad de la familia Pomereu.
                                    </>
                                }
                            />
                            <p className="bt">En cuanto a la naturaleza, lo mejor que he visto por el momento son los alrededores de Tebas<sup
                                className="fn" data-n="29">29</sup>. A partir de Quena, Egipto pierde su aspecto agrícola y pacífico. Una
                                noche, cerca de Dendera<sup className="fn" data-n="30">30</sup>, paseamos bajo los <span className="ht">dums</span>;
                                las montañas eran del color púrpura, el Nilo azul, el cielo azul ultramarino y la vegetación de un verde
                                pálido. Todo estaba inmóvil. Parecía un paisaje pintado. Algunos turcos con turbantes fumaban al pie de los
                                árboles.</p>
                            <InlineNote
                                title={
                                    <>
                                        Maxime Du Camp: <em>Vista de Hamameh</em>, cerca de Dendera
                                    </>
                                }
                                img="../../../public/images/hamameh-dendera.jpg"
                                caption={
                                    <>
                                        Maxime Du Camp: <em>Vista de la aldea de Hamameh, cerca de Dendera</em>.
                                    </>
                                }
                            />
                            <span className="pn">35–36</span>
                        </div>
                    }
                    right={
                        <div className="pg pg-r">
                            <p className="bt">Por cierto, hemos visto ya muchos cocodrilos. Se colocan en los bordes de los islotes, como
                                troncos de árboles varados. Cuando alguien se acerca, se sumergen en el agua como grandes babosas grises.
                                Hay también muchas cigüeñas y grandes grullas a orillas del río, que se juntan en largas filas, alineadas
                                como regimientos.</p>
                            <p className="bt">Por lo demás, aquí, en Nubia, la cosa cambia; hay pocos animales. Esto está cada vez más vacío.
                                El Nilo se estrecha entre roquedales; tan ancho como era, ahora está encajonado, en algunos sitios, entre
                                montañas de piedra. Parece estar inmóvil y liso, centelleante bajo el sol.</p>
                            <p className="bt">Anteayer pasamos las cataratas o, mejor dicho, las cataratas de la primera catarata, pues eso
                                es, de por sí, una región. Negros desnudos cruzan el río sobre troncos de palmeras, remando con las manos.
                                Desaparecen entre los torbellinos de espuma más rápidamente que una guedeja de lana negra arrojada a la
                                corriente de un molino<sup className="fn" data-n="31">31</sup>. Luego, el extremo del tronco del árbol se
                                encabrita como un caballo. Reaparecen, llegan hasta nosotros y suben a bordo; el agua chorrea por sus
                                cuerpos lisos como lo hace por las estatuas de bronce de las fuentes.</p>
                            <p className="bt">Describir la forma en que se vencen las cataratas es demasiado largo. Basta con que sepas que un
                                golpe de timón en falso podría partir el barco contra las rocas. Contamos con aproximadamente ciento
                                cincuenta hombres para remolcar nuestra embarcación. Todos juntos tiran de un largo cable al tiempo que
                                lanzan grandes gritos al unísono.</p>
                            <span className="pn">36–37</span>
                        </div>
                    }
                />
                {/* Spread 6: Pages 11 */}
                <Spread
                    active={spread === 6}
                    flipping={flipping}
                    direction={flipDirection}
                    left={
                        <div className="pg pg-l">
                            <p className="bt dc">En este momento nos hemos detenido por falta de viento. Las moscas me pican el rostro; el
                                joven<sup className="fn" data-n="32">32</sup> Du Camp ha ido a hacer unas pruebas. Se le da bastante bien; creo
                                que tendremos un álbum bastante presentable.</p>
                            <p className="bt">Aún no te he recogido piedras del Nilo, de acuerdo con la promesa que te hice, porque el Nilo
                                tiene pocas piedras. Pero he recogido arena. Aunque resulte difícil, no perdemos la esperanza de exportar
                                (expresión comercial) alguna momia.</p>
                            <p className="bt">Escríbeme pues cartas archilargas, envíame lo que quieras, mientras sea en abundancia.</p>
                            <p className="bt">Dentro de un año, por esta época, estaré de vuelta. Volveremos a nuestros buenos domingos en
                                Croisset. Pronto hará cinco meses que me marché. ¡Ah! Pienso en ti a menudo, viejo amigo. Adiós, recibe un
                                fuerte abrazo, que incluye a tus cuadernos.</p>
                            <div className="divider">— ✦ —</div>
                            <p className="bt">P.S. - Si quieres saber qué pinta tienen nuestras jetas, tenemos el color de una pipa curada<sup
                                className="fn" data-n="33">33</sup>. Estamos engordando y nos está creciendo la barba. Sasseti va vestido a la
                                egipcia. El otro día, Maxime estuvo entonando canciones de Béranger durante dos horas y pasamos toda la
                                velada, hasta medianoche, maldiciendo a ese sonado. ¡Oye! ¡Está claro que la <em>Chanson des Gueux</em><sup
                                    className="fn" data-n="34">34</sup> no está hecha para los socialistas; y que debe gustarles más bien poco!
                            </p>
                            <div className="divider">❧ ❧ ❧</div>
                            <p style={{ textAlign: "center", fontFamily: "var(--font-ui)", fontSize: ".74rem", color: "var(--text-muted)", marginTop: ".6em" }}>
                                Fin de la Carta VI</p>
                            <span className="pn">37-38</span>
                        </div>
                    }

                    right={
                        <div className="pg pg-r pg-end">
                            <div>
                                <div
                                    style={{
                                        color: "var(--accent)",
                                        fontSize: "2.2rem",
                                        marginBottom: "18px",
                                        opacity: 0.4
                                    }}
                                >
                                    ❧
                                </div>

                                <p style={{ marginBottom: "6px" }}>
                                    Gustave Flaubert
                                </p>

                                <p
                                    style={{
                                        fontSize: ".82rem",
                                        color: "var(--text-muted)",
                                        marginBottom: "16px",
                                        fontStyle: "normal"
                                    }}
                                >
                                    <em>Noticias desde El Nilo</em>
                                </p>

                                <p
                                    style={{
                                        fontFamily: "var(--font-ui)",
                                        fontSize: ".68rem",
                                        color: "var(--text-muted)",
                                        letterSpacing: "1px",
                                        textTransform: "uppercase"
                                    }}
                                >
                                    Carta VI · 13 de marzo de 1850
                                </p>
                            </div>
                        </div>
                    }
                />
            </div>
            <button
                type="button"
                className={`nav nav-n ${spread === 6 ? "off" : ""}`}
                onClick={next}
            >
                →
            </button>
        </div>
    );
};

export default Book;