import Head from "next/head";

export default function Landing() {
  return (
    <>
      <Head>
        <title>Budbudbud</title>
        <meta
          name="description"
          content="Budbudbud helps you meet up with friends"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <p className="text-center px-4 max-w-xl">
        Meet with friends and colleagues to share workspaces. Each sunday get
        together to find a day or two (or more!) to meet up somewhere to work
        all together.
      </p>
    </>
  );
}
