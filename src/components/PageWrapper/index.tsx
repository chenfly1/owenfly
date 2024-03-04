export default (props: React.PropsWithChildren<{ title: string }>) => {
  return (
    <>
      <h3
        style={{
          fontSize: '14px',
        }}
      >
        {props.title}
      </h3>
      <section
        style={{
          padding: '16px 0 0',
        }}
      >
        {props.children}
      </section>
    </>
  );
};
