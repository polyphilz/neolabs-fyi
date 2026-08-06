/** The site wordmark, shared by the canvas HUD and the page header. */
export function Wordmark() {
  return (
    <a className="wordmark" href="/">
      {'neolabs'}<span className="wordmark-dot">{'.fyi'}</span>
    </a>
  );
}
