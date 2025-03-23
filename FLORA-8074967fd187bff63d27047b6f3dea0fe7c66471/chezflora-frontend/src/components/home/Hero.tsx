
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Hero carousel images
const heroImages = [
  'https://images.unsplash.com/photo-1483794344563-d27a8d18014e?q=80&w=2070',
  'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?q=80&w=1974',
  'https://images.unsplash.com/photo-1508610048659-a06b669e3321?q=80&w=2070'
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background image carousel with fade transition */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-black/20" />
          <img
            src={image}
            alt={`ChezFlora slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="text-center text-white max-w-3xl animate-fade-up">
          <span className="inline-block text-xs md:text-sm uppercase tracking-widest mb-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            Depuis 2016
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light mb-6 tracking-tight">
            L'art floral pour sublimer vos moments
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto font-light">
            Compositions florales uniques et décoration événementielle sur mesure
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/catalog" 
              className="bg-primary text-white rounded-md px-8 py-3 flex items-center justify-center min-w-[180px] hover:bg-primary/90 transition-all duration-300 hover:translate-y-[-2px]"
            >
              Découvrir
              <ChevronRight size={18} className="ml-2" />
            </Link>
            <Link 
              to="/contact" 
              className="bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-md px-8 py-3 min-w-[180px] hover:bg-white/20 transition-all duration-300 hover:translate-y-[-2px]"
            >
              Contactez-nous
            </Link>
          </div>
        </div>
      </div>
      
      {/* Slide indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-8 bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
