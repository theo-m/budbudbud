import Head from "next/head";
import Image from "next/image";

import insync from "public/insync.svg";
import calendar from "public/calendar.svg";
import work from "public/work.svg";

export default function Landing() {
  return (
    <>
      <Head>
        <title>Budbudbud</title>
        <meta
          name="description"
          content="Budbudbud helps you meet up with friends"
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <div className="flex flex-col flex-grow gap-8 my-16 px-4 max-w-xl">
        <div className="max-w-md mx-4">
          <Image alt="" src={insync} objectFit="contain" />
        </div>
        <h1 className="font-black text-black text-3xl sm:text-4xl text-center">
          Ritualize meeting up with friends and colleagues for workdays!
        </h1>
        <div className="max-w-md mx-4">
          <Image alt="" src={calendar} objectFit="contain" />
        </div>
        <h2 className="font-bold text-xl text-primary text-center">
          Sync up and set up before sunday 8pm for your upcoming week.
        </h2>
        <div className="max-w-md mx-4">
          <Image alt="" src={work} objectFit="contain" />
        </div>
        <p className="text-center mt-16">
          Decide on Budbudbud and let email flows sync up your calendars. Share
          office spaces, lunches & afterworks 🤘
        </p>
      </div>
    </>
  );
}
