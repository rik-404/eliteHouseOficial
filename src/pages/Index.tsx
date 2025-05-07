
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import FeaturedProperties from '@/components/FeaturedProperties';
import PropertySearch from '@/components/PropertySearch';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonials';
import CallToAction from '@/components/CallToAction';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <Hero />
        <PropertySearch />
        <FeaturedProperties />
        <Services />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
