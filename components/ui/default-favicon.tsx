"use client";

import { useEffect, useState } from "react";
import ReactDOMServer from "react-dom/server";

const Svg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export function DefaultFavicon() {
  const [favicon, setFavicon] = useState<string | null>(null);

  useEffect(() => {
    const svgString = ReactDOMServer.renderToString(<Svg />);
    const faviconUri = `data:image/svg+xml;base64,${btoa(svgString)}`;
    setFavicon(faviconUri);
  }, []);

  if (!favicon) return null;

  return <link rel="icon" href={favicon} />;
}
