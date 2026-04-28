export async function downloadTicketPdf(options: {
  element: HTMLElement;
  filename: string;
}) {
  const { element, filename } = options;

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) {
    throw new Error("Popup bloqué : autorise les popups pour télécharger le billet");
  }

  const html = element.outerHTML;

  w.document.open();
  w.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${filename.replace(/</g, "&lt;")}</title>
    <style>
      @page { size: A4 landscape; margin: 12mm; }
      html, body { height: 100%; }
      body {
        margin: 0;
        background: #ffffff;
        color: #000000;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif;
      }
      .page {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 12mm;
      }
      img { max-width: 100%; }
    </style>
  </head>
  <body>
    <div class="page">${html}</div>
    <script>
      window.addEventListener('load', () => {
        document.title = ${JSON.stringify(filename)};
        window.focus();
        window.print();
      });
    </script>
  </body>
</html>`);
  w.document.close();
}
