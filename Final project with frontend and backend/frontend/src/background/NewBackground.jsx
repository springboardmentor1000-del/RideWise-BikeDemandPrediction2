import React, { useEffect, useState } from 'react';
import { Bike, Wind, Zap, MapPin } from 'lucide-react';

export default function RideWiseBackground({children}) {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const bikes = [
    { delay: 0, duration: 25, top: '15%', scale: 1.2 },
    { delay: 8, duration: 30, top: '45%', scale: 0.8 },
    { delay: 15, duration: 28, top: '75%', scale: 1 },
    { delay: 20, duration: 35, top: '30%', scale: 0.9 },
  ];

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 via-transparent to-blue-500/20 animate-pulse" 
           style={{ animationDuration: '8s' }} />
      
      {/* Dynamic radial gradient following mouse */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 transition-all duration-500"
        style={{
          background: 'radial-gradient(circle, rgba(251,146,60,0.8) 0%, rgba(168,85,247,0.4) 50%, transparent 70%)',
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Road lines */}
      <div className="absolute inset-0 flex justify-around items-center opacity-10">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-full bg-gradient-to-b from-transparent via-white to-transparent animate-pulse"
            style={{ animationDelay: `${i * 0.5}s`, animationDuration: '3s' }}
          />
        ))}
      </div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-orange-400/40 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Animated bikes */}
      {bikes.map((bike, idx) => (
        <div
          key={idx}
          className="absolute left-0 animate-bike-ride"
          style={{
            top: bike.top,
            animationDelay: `${bike.delay}s`,
            animationDuration: `${bike.duration}s`,
            transform: `scale(${bike.scale})`,
          }}
        >
          <Bike className="w-16 h-16 text-orange-500 drop-shadow-2xl" strokeWidth={1.5} />
          <div className="absolute -right-8 top-1/2 -translate-y-1/2">
            <Wind className="w-8 h-8 text-orange-300/50 animate-pulse" />
          </div>
        </div>
      ))}

      {/* Speed lines */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-speed-line"
            style={{
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 200 + 100}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 1}s`,
            }}
          />
        ))}
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-orange-500/30 rounded-full blur-3xl animate-pulse" 
           style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-32 left-32 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl animate-pulse" 
           style={{ animationDuration: '5s', animationDelay: '1s' }} />

      {/* Main content area */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 text-center">
          {children}
        {/* Feature cards */}
      </div>

      <style jsx>{`
        @keyframes bike-ride {
          0% {
            transform: translateX(-100px) translateY(0) scale(var(--scale, 1));
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(-20px) scale(var(--scale, 1));
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes speed-line {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100vw);
            opacity: 0;
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-bike-ride {
          animation: bike-ride linear infinite;
        }

        .animate-float {
          animation: float ease-in-out infinite;
        }

        .animate-speed-line {
          animation: speed-line linear infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}