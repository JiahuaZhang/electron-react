import React, { useState, useEffect } from 'react';

import { manifest, EPub } from './book.type';

interface Props {
  section: manifest;
  book: EPub;
}

export const Section: React.FC<Props> = ({ section, book }) => {
  const [html, setHtml] = useState(<></>);

  useEffect(() => {
    try {
      book.getChapter(section.id, (err, text) => {
        if (err) {
          console.error(err);
          alert(err.message);
          return;
        }

        if (text.includes('<image')) {
          const matches = text.match(/xlink:href="(.*)"/);

          if (matches && matches.length > 2) {
            alert('special case such that thic chapter include more than 1 image!s');
            return;
          }

          if (matches && matches[1]) {
            const imageFileName = matches[1];

            book.getImage(imageFileName.split('.')[0], (err, data, mimeType) => {
              text = text.replace(
                matches[0],
                `xlink:href="data:${mimeType};base64, ${data.toString('base64')}"`
              );
              setHtml(<div dangerouslySetInnerHTML={{ __html: text }}></div>);
            });
          }
        } else {
          setHtml(<div dangerouslySetInnerHTML={{ __html: text }}></div>);
        }
      });
    } catch (error) {
      console.error(section);
      console.error(error);
    }
  }, [section, book]);

  return html;
};
