"use client";
import Particles from "@tsparticles/react";

export default function ParticleBackground() {
  return (
    <Particles
      id="tsparticles"
      options={{
        preset: "links",
        fullScreen: { enable: false },
        background: { color: { value: "transparent" } },
        particles: {
          number: { value: 30, density: { enable: true } },
          color: { value: "#ffffff" },
          opacity: { value: 0.2 },
          size: { value: { min: 1, max: 2 } },
          move: { enable: true, speed: 0.5, direction: "none", outModes: { default: "out" } },
          links: { enable: false }
        }
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none"
      }}
    />
  );
} 