import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Trophy, Users } from 'lucide-react';

const STATS = [
  { icon: Users, value: '24+', label: 'Equipos' },
  { icon: MapPin, value: '2', label: 'Ciudades' },
  { icon: Calendar, value: 'U15 · U17', label: 'Categorías' },
  { icon: Trophy, value: '2026', label: 'Edición' },
];

export default function HeroBanner() {
  return (
    <section className='relative overflow-hidden bg-black'>
      <div className='relative min-h-[720px] md:min-h-[760px] lg:min-h-screen'>
        <picture className='absolute inset-0'>
          <source
            media='(max-width: 768px)'
            srcSet='/images/hero-copa-kenia-mobile.png'
          />

          <img
            src='/images/hero-copa-kenia.png'
            alt='Copa Kenia'
            className='w-full h-full object-cover object-center'
          />
        </picture>

        <div className='absolute inset-0 bg-black/45' />
        <div className='absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-background' />
        <div className='absolute inset-0 bg-gradient-to-r from-blue-950/25 via-transparent to-orange-950/25' />

        <div className='relative z-10 max-w-7xl mx-auto px-4 pt-28 pb-10'>
          <div className='flex min-h-[520px] md:min-h-[540px] lg:min-h-[610px] flex-col items-center justify-center text-center'>
            <div className='w-full max-w-5xl px-4'>
              <p className='font-display text-[10px] md:text-sm tracking-[0.32em] md:tracking-[0.55em] uppercase text-white/75 mb-3 md:mb-5'>
                Torneo Internacional de Básquet
              </p>

              <h1 className='font-display text-[46px] sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-wider leading-none text-white drop-shadow-[0_0_45px_rgba(0,0,0,1)]'>
                COPA KENIA
              </h1>

              <h2 className='font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-[0.12em] text-primary mt-2 drop-shadow-[0_0_24px_rgba(255,120,0,.9)]'>
                COMERCIAL ELDORADO
              </h2>

              <p className='font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary mt-3 drop-shadow-[0_0_24px_rgba(255,120,0,.9)]'>
                2026
              </p>

              <p className='mt-4 md:mt-6 max-w-3xl mx-auto text-sm sm:text-base md:text-xl text-white/90 px-2 drop-shadow-[0_2px_12px_rgba(0,0,0,.9)]'>
                Dos ciudades. Una pasión. Viví la emoción del básquet
                internacional.
              </p>

              <div className='flex flex-col sm:flex-row gap-3 md:gap-4 mt-7 md:mt-9 w-full max-w-md sm:max-w-none mx-auto justify-center px-2 sm:px-0'>
                <Link to='/torneos' className='w-full sm:w-auto'>
                  <Button className='w-full sm:w-auto h-12 md:h-13 px-10 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(255,120,0,0.55)]'>
                    Ver torneos
                  </Button>
                </Link>

                <Link to='/publicaciones' className='w-full sm:w-auto'>
                  <Button
                    variant='outline'
                    className='w-full sm:w-auto h-12 md:h-13 px-10 rounded-xl border-white/25 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 font-bold'
                  >
                    Publicaciones
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-6 md:mt-2 relative z-20'>
            {STATS.map((item, index) => (
              <div
                key={index}
                className='group relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-4 md:p-5 text-center shadow-[0_0_40px_rgba(0,0,0,0.35)] hover:border-primary/60 hover:-translate-y-1 transition-all duration-300'
              >
                <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/10 via-transparent to-secondary/10' />

                <div className='relative z-10'>
                  <item.icon className='w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-primary' />

                  <p className='font-display text-3xl md:text-4xl font-bold text-white'>
                    {item.value}
                  </p>

                  <p className='text-[10px] md:text-xs uppercase tracking-[0.18em] md:tracking-[0.25em] text-white/60 mt-1'>
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
