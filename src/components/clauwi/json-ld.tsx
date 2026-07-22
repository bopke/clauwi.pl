/**
 * Renders a Schema.org JSON-LD block. `data` should be a plain object (or
 * array of objects) — JSON.stringify handles escaping; React's
 * dangerouslySetInnerHTML is safe here since the content is JSON, not HTML.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
