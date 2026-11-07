// Section heading. Kept the text1/text2 API so existing pages keep working.
const Title = ({ text1, text2 }) => (
  <h2 className="font-display text-3xl sm:text-4xl tracking-wide text-ink">
    <span className="capitalize">{String(text1).toLowerCase()}</span>{" "}
    <span className="capitalize">{String(text2).toLowerCase()}</span>
  </h2>
);

export default Title;
