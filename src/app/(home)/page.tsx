"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

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
        className="grid grid-rows-[20px_1fr_20px] w-[98%] mx-auto bg-white text-black items-center justify-items-center min-h-screen pt-8 px-4 pb-20 gap-16 sm:pt-20 sm:px-20 font-[family-name:var(--space-mono)]"
      >
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <h1 className="text-4xl font-[family-name:var(--space-mono-bold)]">Coming Soon</h1>
        </main>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        </footer>
      </section>
    </div>
  );
}
