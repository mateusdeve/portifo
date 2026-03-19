export function CanvasVisuals() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-[600px] h-[400px] rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-0 bg-surface-container-low/40 backdrop-blur-md border border-primary/10" />

        <img
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          alt="Abstract emerald neon fluid waves and curves"
          data-alt="Abstract emerald neon fluid waves and curves"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUd7PXWDh4RTCU2grmwSwPQCwLaIQUm06dB-1LZwg3zOeeIfUx7NaVa_CDSNAT-1aD3TYpEaJ-wSR_cQ1Jq4dcgVTK0I9gVaPsPUxcU6MM_3Pecm9WDRYnLEMIY_kE3H-XObPHOc6rtIyCYyYRvt4PUu2UtOonAdzZ8khAM5PPSzBExZrMYpnAwOSuTDEGXAgF4O-F1ozl6u__nAJWVb1v7fybptpm6GZVe7QVit2rbm1XkYIldq-NNiNoNLHiZtl57H1r5bRXmwQ"
        />

        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-4xl font-headline font-extrabold text-[#6bfe9c] mb-2 tracking-tighter">
            Neon Portfolio
          </h1>
          <p className="text-on-surface-variant text-sm max-w-xs">
            Building the future of creative development interfaces.
          </p>
        </div>
      </div>
    </div>
  );
}

