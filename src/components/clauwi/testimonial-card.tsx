/** A testimonial as on /opinie: bordered, rounded box with title and text, author below. */
export function TestimonialCard({
  title,
  children,
  author,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  author: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[810px] text-center">
      <div className="rounded-[10px] border-2 border-[#eee] p-[27px]">
        <h2 className="mb-[14px] font-heading text-[28px] font-bold leading-[42px] text-[#1a202c]">{title}</h2>
        <div>{children}</div>
      </div>
      <div className="mt-5 flex items-center justify-center">
        <div>{author}</div>
      </div>
    </div>
  );
}
