"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 700, // Animation duration in milliseconds
      easing: "ease-in-out", // Easing function
      once: false, // Whether animation should only happen once
    });
  }, []);

  return (
    <div>
      <section
        id="about"
        data-aos="zoom-in"
        data-aos-duration=""
        className="flex flex-col w-[98%] mx-auto bg-white text-black items-center h-auto min-h-screen pt-8 px-4 pb-20 gap-16 sm:pt-20 md:pt-32 lg:px-16 font-[family-name:var(--space-mono)]"
      >
        <div className="flex flex-col justify-center text-center gap-4">
          <h1 className="text-4xl md:text-5xl leading-tight font-[family-name:var(--space-mono-bold)]">
            INTRODUCING: DIGITAL SIGNATURE
          </h1>
          <p className="text-sm">
            DIGITAL SIGNATURE PROTOCOL IS A WEB APPLICATION TO EASILY SIGN YOUR
            DOCUMENTS WITHOUT HASSLE.
          </p>
          <p className="text-sm font-[family-name:var(--space-mono-bold)]">
            Here's how to use our services:
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-5 w-full lg:h-[32vh]">
          <div
            data-aos="zoom-in"
            className="flex flex-col gap-6 w-full lg:w-1/3 h-[55vh] md:h-[40vh] p-8 border border-black shadow-custom"
          >
            <Image
              src="/user.svg"
              alt="User"
              width={80}
              height={80}
              className=""
            />
            <h2 className="text-2xl">1. REGISTER TO DINER</h2>
            <p className="text-sm">
              Register to our protocol and upload your signature in the form.
            </p>
          </div>
          <div
            data-aos="zoom-in"
            className="flex flex-col gap-6 w-full lg:w-1/3 h-[55vh] md:h-[40vh] px-6 py-8 border border-black shadow-custom"
          >
            <Image
              src="/upload.svg"
              alt="Upload"
              width={80}
              height={80}
              className=""
            />
            <h2 className="text-2xl">2. UPLOAD YOUR DOCUMENTS & REQUEST</h2>
            <p className="text-sm">
              Fill in the required data and choose appropriate location for your
              signature.
            </p>
          </div>
          <div
            data-aos="zoom-in"
            className="flex flex-col gap-6 w-full lg:w-1/3 h-[55vh] md:h-[40vh] px-6 py-8 border border-black shadow-custom"
          >
            <Image
              src="/download.svg"
              alt="Download"
              width={80}
              height={80}
              className="text-sm"
            />
            <h2 className="text-2xl">3. DOWNLOAD YOUR DOCUMENTS</h2>
            <p className="">
              After your request is approved, download your documents on the
              dashboard page.
            </p>
          </div>
        </div>
      </section>
      <footer className="flex gap-6 flex-wrap items-center justify-center bg-white text-black font-[family-name:var(--space-mono)]">
        © 2024 Diner
      </footer>
    </div>
  );
}
