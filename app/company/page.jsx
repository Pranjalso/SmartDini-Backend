"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollAnimations from "@/components/ScrollAnimations";
import { Button } from "@/components/ui/button";
import { Target, Zap, Coffee, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, textVariant } from "@/utils/motion";
import Head from "next/head";

const CompanyPage = () => {
  // Handle scroll animations
  useEffect(() => {
    // Your custom scroll animation logic if needed
  }, []);

  return (
    <div className="bg-white">
      <Head>
        <title>About Astex - SMARTDINI</title>
        <meta
          name="description"
          content="Learn about Astex, the company behind SMARTDINI - revolutionizing cafe operations with smart QR ordering technology."
        />
      </Head>
      <ScrollAnimations />
      <Header />
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative bg-white py-28 md:py-36 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-[length:300px_300px] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.h1
                variants={textVariant(0.1)}
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 mt-24 text-black leading-tight"
              >
                About <span className="text-primary">Astex</span>
              </motion.h1>
              <motion.p
                variants={textVariant(0.2)}
                className="text-md md:text-lg text-gray-600 mb-10 max-w-2xl mx-auto"
              >
                The innovative team behind{" "}
                <span className="font-semibold text-primary">SMARTDINI</span>, revolutionizing
                the cafe industry
              </motion.p>
              <motion.div variants={textVariant(0.3)}>
                <Button
                  size="lg"
                  className="text-sm mt-4 px-6 py-3 bg-primary hover:bg-primary/90 text-white"
                >
                  Visit our website
                </Button>
              </motion.div>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        </section>

        {/* Our Story Section */}
        <section className="relative py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
                className="order-2 lg:order-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-0.5 bg-primary"></div>
                  <span className="text-sm font-medium tracking-wider text-primary uppercase">
                    Our Journey
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                  Building Solutions for{" "}
                  <span className="text-primary">Modern Cafes</span>
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Founded in 2018, Astex began with a simple mission: to solve
                  the everyday challenges faced by cafe owners and enhance the
                  customer experience through innovative technology.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  What started as a small team of passionate tech enthusiasts
                  and former cafe owners has grown into a global company serving
                  over 500 cafes worldwide with our flagship product,{" "}
                  <span className="font-semibold text-primary">SMARTDINI</span>.
                </p>
                <p className="text-lg text-gray-600">
                  Our journey has been driven by continuous innovation, customer
                  feedback, and a deep understanding of the hospitality
                  industry's unique challenges.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
                className="order-1 lg:order-2 relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl pb-10">
                  <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <span className="text-white text-2xl">Team Image</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg w-1/2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                          <path d="m9 12 2 2 4-4"></path>
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900">
                        500+ Happy Clients
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Cafes worldwide trust Astex solutions to streamline their
                      operations and enhance customer experience.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 md:py-28 bg-gray-50 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-0.5 bg-primary"></div>
                <span className="text-sm font-medium tracking-wider text-primary uppercase">
                  Our Purpose
                </span>
                <div className="w-8 h-0.5 bg-primary"></div>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
                Our Mission & <span className="text-primary">Vision</span>
              </h2>
              <p className="text-lg text-gray-600">
                Driving the future of hospitality technology with clear goals
                and purpose.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Mission */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Target className="text-blue-600" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center">
                  Our Mission
                </h3>
                <p className="text-gray-600 text-center">
                  To empower cafe owners with intuitive technology that
                  simplifies operations, enhances customer experiences, and
                  drives business growth through innovation and reliability.
                </p>
              </motion.div>

              {/* Vision */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Zap className="text-purple-600" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center">
                  Our Vision
                </h3>
                <p className="text-gray-600 text-center">
                  To become the leading technology partner for hospitality
                  businesses worldwide, creating seamless digital experiences
                  that connect cafes with their customers in meaningful ways.
                </p>
              </motion.div>

              {/* Approach */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Coffee className="text-green-600" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center">
                  Our Approach
                </h3>
                <p className="text-gray-600 text-center">
                  We combine deep industry knowledge with technical expertise to
                  create solutions that are both powerful and easy to use,
                  ensuring cafe owners can focus on what they do best.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 md:py-28 bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="max-w-4xl mx-auto mb-16 text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-0.5 bg-primary"></div>
                <span className="text-sm font-medium tracking-wider text-primary uppercase">
                  Our Values
                </span>
                <div className="w-8 h-0.5 bg-primary"></div>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
                What Guides <span className="text-primary">Our Work</span>
              </h2>
              <p className="text-lg text-gray-600">
                At Astex, we're guided by a set of core principles that shape
                everything we do.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Innovation First
                </h3>
                <p className="text-gray-600">
                  We constantly push boundaries to create solutions that
                  transform the cafe industry, making operations smoother and
                  customer experiences better.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Customer-Centric
                </h3>
                <p className="text-gray-600">
                  Every feature we develop starts with understanding our
                  customers' needs. We listen, learn, and build solutions that
                  truly matter.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Simplicity
                </h3>
                <p className="text-gray-600">
                  We believe powerful technology should be easy to use. Our
                  products are designed to be intuitive, accessible, and
                  straightforward.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Technology & Innovation Section */}
        <section className="py-20 md:py-28 bg-gray-50 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
                className="order-2 lg:order-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-0.5 bg-primary"></div>
                  <span className="text-sm font-medium tracking-wider text-primary uppercase">
                    Our Technology
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                  Powered by <span className="text-primary">Innovation</span>
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  At Astex, we leverage cutting-edge technology to create
                  seamless experiences for both cafe owners and their customers.
                </p>
                <div className="space-y-4 mb-8">
                  <p className="text-gray-600">
                    • Advanced QR code technology for instant menu access
                  </p>
                  <p className="text-gray-600">
                    • Real-time order management system
                  </p>
                  <p className="text-gray-600">
                    • Data analytics for business insights
                  </p>
                  <p className="text-gray-600">
                    • Cloud-based infrastructure for reliability
                  </p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 px-6 py-3 text-white">
                  Explore Our Technology
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
                className="order-1 lg:order-2"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl pb-10">
                  <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-300 to-purple-400 flex items-center justify-center">
                      <span className="text-white text-2xl">Technology Display</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg w-2/3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Zap className="text-primary" size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        Cutting-Edge Features
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      SmartDini integrates innovation and simplicity—making cafe
                      ordering effortless, fast, and reliable for both staff and
                      customers.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 md:py-28 bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-0.5 bg-primary"></div>
                <span className="text-sm font-medium tracking-wider text-primary uppercase">
                  Meet Our Team
                </span>
                <div className="w-8 h-0.5 bg-primary"></div>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
                The People Behind <span className="text-primary">Astex</span>
              </h2>
              <p className="text-lg text-gray-600">
                A passionate group of innovators, designers, and engineers
                working together to shape the future of cafe technology.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center"
              >
                <div className="w-28 h-28 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Aditya Patel</h3>
                <p className="text-gray-600 text-sm mb-3">Founder & CEO</p>
                <p className="text-gray-600 text-sm">
                  Leading innovation at Astex with a vision to simplify cafe
                  operations and deliver digital-first solutions.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center"
              >
                <div className="w-28 h-28 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Shivani Rathore</h3>
                <p className="text-gray-600 text-sm mb-3">Co-Founder & COO</p>
                <p className="text-gray-600 text-sm">
                  Driving growth, partnerships, and operational excellence at
                  Astex to scale SmartDini globally.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center"
              >
                <div className="w-28 h-28 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">👥</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Astex Team</h3>
                <p className="text-gray-600 text-sm mb-3">Developers & Designers</p>
                <p className="text-gray-600 text-sm">
                  A skilled team focused on building seamless, reliable, and
                  innovative solutions for the cafe industry.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 md:py-28 bg-primary text-white relative z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            >
              Ready to Transform Your <span className="font-bold">Cafe</span>?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
            >
              Join hundreds of cafes already using SmartDini to speed up service,
              reduce wait times, and delight customers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                className="bg-black/20 hover:bg-black/30 text-white font-semibold"
              >
                Request a Demo
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default CompanyPage;