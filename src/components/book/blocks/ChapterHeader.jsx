import { parseText } from './parseText';

/**
 * ChapterHeader — cabecera de carta
 * La dedicatoria puede llevar marcador [fn:N] (llamada de nota al destinatario).
 */
export default function ChapterHeader({ series, title, dedication, location,
                                        textOpts }) {
  return (
    <div className="hdr">
      {series     && <p className="sub">{series}</p>}
      {title      && <h1>{title}</h1>}
      {dedication && <p className="ded">{parseText(dedication, textOpts)}</p>}
      {location   && <p className="loc">{parseText(location, textOpts)}</p>}
    </div>
  );
}
