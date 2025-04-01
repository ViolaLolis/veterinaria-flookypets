import React from 'react';
import Header from '../Estructura/Header';
import Servicios from '../Estructura/Services';
import Footer from '../Estructura/Footer';
import Hero from '../Estructura/Hero';
import AboutUs from '../Estructura/AboutUs';
import ContactInfo from '../Estructura/ContactInfo';
import ImageCarousel from '../Estructura/ImageCarousel';

function Main() {
  return (
    <div>
      <Header />
      <ImageCarousel />
      <Hero />
      <Servicios />
      <AboutUs />
      <ContactInfo />
      <Footer />
    </div> 
  );
}

export default Main;


