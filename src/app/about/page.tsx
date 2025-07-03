"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import YoutubeEmbed from "@/components/about/YoutubeEmbed";

export default function AboutPage() {

  const team = [
    {
      name: "Sayyid Hameed Ali Shihab Thangal",
      position: "President AIC",
      bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
      image: "/images/Thangal.jpg",
    },
    {
      name: "Musthafa Hudawi Akode",
      position: "Secretary AIC",
      bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
      image: "/images/Musthafa-usthad.jpg",
    },
    {
      name: "M.P Abdulla Haji Parakkadavu",
      position: "Treasurer AIC",
      bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
      image: "/api/placeholder/300/300",
    },
    // {
    //   name: "",
    //   position: "Community Welfare Manager",
    //   bio: "Yusuf ensures the well-being of over 450 orphans, coordinating support for their homes and families.",
    //   image: "/api/placeholder/300/300",
    // },
  ];

  const milestones = [
    {
      year: "2000",
      title: "Akode Islamic Centre Founded",
      description: "Established as an educational and cultural hub with a mission to support orphans and promote Islamic learning.",
    },
    {
      year: "2005",
      title: "Hifz Program Launched",
      description: "Oorkadavu Qasim Musliyar Thahfeezul Quran College began, offering Quran memorization to students.",
    },
    {
      year: "2010",
      title: "Orphan Care Initiative",
      description: "Started caring for 450+ orphans, ensuring they live safely with their mothers under AIC's support.",
    },
    {
      year: "2015",
      title: "Expansion of Institutes",
      description: "Added Islamic Da'wa Academy, Daiya Islamic Academy, and AMUP School to enhance educational offerings.",
    },
    {
      year: "2020",
      title: "Cultural and Nursery Programs",
      description: "Introduced Bright Public Nursery School and Ayaadi Life Education to broaden community impact.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className={"min-h-screen transition-colors duration-300 "}>

      {/* Page Header */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <Link href="/" className="inline-flex items-center text-indigo-200 hover:text-white mb-6 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">About Akode Islamic Centre</h1>
          <p className="text-xl text-indigo-200 max-w-3xl">Discover our mission to educate, uplift orphans, and enrich our community through culture and faith.</p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="inline-block p-2 px-5 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-800 dark:text-indigo-200 font-medium text-sm mb-3">
                Our Mission
              </div>
              <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-200 mb-6">Nurturing Education and Orphan Care</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Akode Islamic Centre (AIC) is dedicated to providing exceptional Islamic education and comprehensive care for orphans. As an Educational & Cultural Centre, we operate over five institutes, serving our community with faith-based learning and cultural enrichment.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We proudly support over 450 orphans, ensuring they live safely and happily at home with their mothers. Our holistic approach combines spiritual growth, academic excellence, and community welfare, rooted in Islamic values.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Quran memorization and Islamic education",
                  "Care for 450+ orphans with their families",
                  "Higher studies for boys and girls",
                  "Cultural and primary education programs",
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced YouTube Video Component */}
            <div className="order-1 lg:order-2">
              <YoutubeEmbed videoId={process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID || "rlcfa2S5e7A"} />
            </div>
          </div>
        </div>
      </section>

      {/* Our History Timeline */}
      <section className="py-16 px-6 bg-indigo-50 dark:bg-gray-700">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block p-2 px-5 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-800 dark:text-purple-200 font-medium text-sm mb-3">
              Our Journey
            </div>
            <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-200 mb-4">Key Milestones of Akode Islamic Centre</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our journey reflects a commitment to education, orphan welfare, and cultural development, impacting thousands of lives.
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-indigo-200 dark:bg-indigo-600"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className="md:w-1/2"></div>
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center z-10 text-lg font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="md:w-1/2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <div className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-medium rounded-full mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block p-2 px-5 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-800 dark:text-indigo-200 font-medium text-sm mb-3">
              Our Team
            </div>
            <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-200 mb-4">The Heart of Akode Islamic Centre</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our team is driven by a passion for Islamic education and orphan care, working tirelessly to serve our community.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-64 w-full">
                  <Image src={member.image} alt={member.name} className="object-cover" fill />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-1">{member.name}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-3">{member.position}</p>
                  <p className="text-gray-600 dark:text-gray-300">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Institutes Section */}
      <section className="py-16 px-6 bg-indigo-50 dark:bg-gray-700">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block p-2 px-5 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-800 dark:text-purple-200 font-medium text-sm mb-3">
              Our Institutes
            </div>
            <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-200 mb-4">Educational Excellence at AIC</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We operate over five institutes, each dedicated to fostering Islamic education, cultural growth, and academic success.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                name: "Oorkadavu Qasim Musliyar Thahfeezul Quran College",
                desc: "A premier institute for Quran memorization (Hifz Program).",
              },
              {
                name: "Islamic Da'wa Academy",
                desc: "Higher studies program for boys after completing Hifz.",
              },
              {
                name: "Daiya Islamic Academy",
                desc: "Higher studies program for girls after SSLC.",
              },
              {
                name: "AMUP School",
                desc: "Aided Upper Primary School for foundational education.",
              },
              {
                name: "Bright Public Nursery School",
                desc: "Nursery education with a focus on early development.",
              },
              {
                name: "Ayaadi Life Education",
                desc: "Holistic life skills and Islamic values education.",
              },
            ].map((institute, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md"
              >
                <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-2">{institute.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{institute.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3 mb-10 md:mb-0">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-3xl font-bold mb-4"
              >
                Support Akode Islamic Centre
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-xl text-indigo-100 max-w-xl"
              >
                Your contributions help us educate hundreds of students and care for over 450 orphans. Join us in this noble cause.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/donation"
                className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-300"
              >
                Donate Now
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Contact Us
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}



// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { motion } from "framer-motion";
// import { useState } from "react";
// import YoutubeEmbed from "@/components/about/YoutubeEmbed";

// // Define TypeScript interfaces for data structures
// interface TeamMember {
//   name: string;
//   position: string;
//   bio: string;
//   image: string;
// }

// interface Milestone {
//   year: string;
//   title: string;
//   description: string;
//   icon: string;
// }

// interface Testimonial {
//   quote: string;
//   author: string;
//   role: string;
//   image: string;
// }

// interface Institute {
//   name: string;
//   desc: string;
//   icon: string;
// }

// interface Value {
//   title: string;
//   description: string;
//   icon: string;
// }

// interface Statistic {
//   value: string;
//   label: string;
// }

// export default function AboutPage() {
//   const [activeTab, setActiveTab] = useState<"mission" | "vision" | "values">("mission");

//   // Team data
//   const team: TeamMember[] = [
//     {
//       name: "Sheikh Ahmed Qasim",
//       position: "Founder & Director",
//       bio: "Sheikh Ahmed has dedicated over 25 years to Islamic education and orphan welfare. His vision has transformed Akode Islamic Centre into a beacon of knowledge and compassion, impacting thousands through innovative programs.",
//       image: "/api/placeholder/400/400",
//     },
//     {
//       name: "Hafiz Ismail",
//       position: "Head of Hifz Program",
//       bio: "Hafiz Ismail brings 18 years of Quranic expertise. A graduate from Al-Azhar University, he developed a unique methodology balancing traditional memorization with modern education.",
//       image: "/api/placeholder/400/400",
//     },
//     {
//       name: "Amina Rahman",
//       position: "Coordinator, Daiya Islamic Academy",
//       bio: "Amina leads the women's higher studies program with a Master's in Islamic Studies. Her curricula integrate Islamic values with contemporary education, empowering hundreds of graduates.",
//       image: "/api/placeholder/400/400",
//     },
//     {
//       name: "Yusuf Khan",
//       position: "Community Welfare Manager",
//       bio: "Yusuf oversees orphan care for 450+ children, ensuring financial, emotional, and educational support while keeping families intact.",
//       image: "/api/placeholder/400/400",
//     },
//   ];

//   // Milestones data
//   const milestones: Milestone[] = [
//     {
//       year: "2000",
//       title: "Akode Islamic Centre Founded",
//       description: "Established as a hub for education and culture with 25 students in a small rented facility.",
//       icon: "🕌",
//     },
//     {
//       year: "2005",
//       title: "Hifz Program Launched",
//       description: "Oorkadavu Qasim Musliyar Thahfeezul Quran College began, with 15 hafiz graduates in its first class.",
//       icon: "📖",
//     },
//     {
//       year: "2010",
//       title: "Orphan Care Initiative",
//       description: "Launched care for 450+ orphans, providing education, healthcare, and mentorship within families.",
//       icon: "👨‍👩‍👧‍👦",
//     },
//     {
//       year: "2015",
//       title: "Expansion of Institutes",
//       description: "Added Islamic Da'wa Academy, Daiya Islamic Academy, and AMUP School to broaden educational scope.",
//       icon: "🏫",
//     },
//     {
//       year: "2020",
//       title: "Cultural and Nursery Programs",
//       description: "Introduced Bright Public Nursery School and Ayaadi Life Education for early childhood and cultural growth.",
//       icon: "🌱",
//     },
//     {
//       year: "2024",
//       title: "Digital Learning Initiative",
//       description: "Launched online platforms for global access to classes, resources, and mentorship.",
//       icon: "💻",
//     },
//   ];

//   // Testimonials data
//   const testimonials: Testimonial[] = [
//     {
//       quote:
//         "The Hifz program transformed my son's life, building discipline and confidence for his medical studies. The balance of spiritual and academic education is unmatched.",
//       author: "Abdullah Rahman",
//       role: "Parent of Hifz Graduate & Medical Student",
//       image: "/api/placeholder/150/150",
//     },
//     {
//       quote:
//         "As a widow, I feared for my children's future. AIC's support gave them education and care. My eldest son is now an engineer, thanks to AIC's lasting impact.",
//       author: "Fatima Begum",
//       role: "Mother of Orphans Under AIC Care",
//       image: "/api/placeholder/150/150",
//     },
//     {
//       quote:
//         "Daiya Islamic Academy gave me purpose. Its curriculum prepared me to teach at a university while upholding Islamic values. I support AIC monthly.",
//       author: "Afthah",
//       role: "Daiya Academy Alumna, University Professor",
//       image: "/api/placeholder/150/150",
//     },
//     {
//       quote:
//         "AIC's holistic approach creates resilient graduates. Their family-centered model for orphans is exceptional, reflected in their success stories.",
//       author: "Dr. Mohammed Ali",
//       role: "Education Policy Advisor & Community Leader",
//       image: "/api/placeholder/150/150",
//     },
//   ];

//   // Institutes data
//   const institutes: Institute[] = [
//     {
//       name: "Oorkadavu Qasim Musliyar Thahfeezul Quran College",
//       desc: "Combines Quranic memorization with modern education for spiritual and academic excellence.",
//       icon: "📖",
//     },
//     {
//       name: "Islamic Da'wa Academy",
//       desc: "Advanced Islamic studies for boys post-Hifz, covering Fiqh, Hadith, and modern subjects.",
//       icon: "🎓",
//     },
//     {
//       name: "Daiya Islamic Academy",
//       desc: "Higher education for girls, blending Islamic sciences with leadership and modern disciplines.",
//       icon: "👩‍🎓",
//     },
//     {
//       name: "AMUP School",
//       desc: "Aided upper primary school offering foundational education with moral development.",
//       icon: "🏫",
//     },
//     {
//       name: "Bright Public Nursery School",
//       desc: "Focuses on holistic early childhood development with play-based Islamic teachings.",
//       icon: "🌱",
//     },
//     {
//       name: "Ayaadi Life Education",
//       desc: "Teaches life skills, ethics, and leadership through experiential learning.",
//       icon: "✨",
//     },
//   ];

//   // Values data
//   const values: Value[] = [
//     {
//       title: "Faith-Centered Education",
//       description: "Integrating Islamic principles into learning for ethical understanding.",
//       icon: "☪️",
//     },
//     {
//       title: "Family Preservation",
//       description: "Supporting orphans to thrive with their families, prioritizing maternal care.",
//       icon: "❤️",
//     },
//     {
//       title: "Excellence & Innovation",
//       description: "Pursuing high standards while adapting to evolving educational needs.",
//       icon: "⭐",
//     },
//     {
//       title: "Holistic Development",
//       description: "Nurturing spiritual, intellectual, emotional, and physical growth.",
//       icon: "🌱",
//     },
//     {
//       title: "Community Service",
//       description: "Instilling compassion and leadership for societal contributions.",
//       icon: "🤲",
//     },
//     {
//       title: "Sustainability",
//       description: "Creating lasting impact through long-term, scalable programs.",
//       icon: "♻️",
//     },
//   ];

//   // Statistics data
//   const statistics: Statistic[] = [
//     { value: "25+", label: "Years of Service" },
//     { value: "5,000+", label: "Students Educated" },
//     { value: "450+", label: "Orphans Supported" },
//     { value: "6", label: "Educational Institutes" },
//     { value: "97%", label: "Graduation Rate" },
//     { value: "120+", label: "Staff Members" },
//   ];

//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//         delayChildren: 0.1,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: { type: "spring", stiffness: 70, damping: 10 },
//     },
//   };

//   return (
//     <div className="min-h-screen text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//       {/* Hero Section */}
//       <section className="pt-48 pb-16 px-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white relative overflow-hidden">
//         <div
//           className="absolute inset-0 opacity-10 pointer-events-none"
//           style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//           }}
//         />
//         <motion.div
//           className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-purple-900/30"
//           animate={{
//             background: [
//               "linear-gradient(to bottom right, rgba(49, 46, 129, 0.3), rgba(76, 29, 149, 0.3))",
//               "linear-gradient(to bottom right, rgba(76, 29, 149, 0.3), rgba(49, 46, 129, 0.3))",
//             ],
//           }}
//           transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
//         />
//         <div className="container mx-auto max-w-6xl relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, ease: "easeOut" }}
//             className="max-w-3xl"
//           >
//             <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight">
//               About{" "}
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
//                 Akode Islamic Centre
//               </span>
//             </h1>
//             <p className="text-xl md:text-2xl text-indigo-100 font-light leading-relaxed mb-8">
//               Transforming lives through education and compassion since 2000.
//             </p>
//             <div className="flex flex-wrap gap-4">
//               <Link
//                 href="#mission"
//                 className="px-6 py-3 bg-white text-indigo-900 rounded-lg font-medium transition-all hover:shadow-lg hover:bg-indigo-50 focus:ring focus:ring-white/30 focus:outline-none"
//               >
//                 Our Mission
//               </Link>
//               <Link
//                 href="#donation"
//                 className="px-6 py-3 bg-transparent border-2 border-white/80 text-white rounded-lg font-medium transition-all hover:bg-white/10 focus:ring focus:ring-white/30 focus:outline-none"
//               >
//                 Support Our Cause
//               </Link>
//             </div>
//           </motion.div>
//           <motion.div
//             className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-16"
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//           >
//             {statistics.map((stat, index) => (
//               <motion.div
//                 key={index}
//                 variants={itemVariants}
//                 className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20 hover:bg-white/15 transition-colors"
//               >
//                 <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
//                 <p className="text-indigo-200 text-sm">{stat.label}</p>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       {/* Mission & Vision Section */}
//       <section id="mission" className="py-20 px-6 bg-gray-50 dark:bg-gray-900 relative">
//         <div className="container mx-auto max-w-6xl">
//           <div className="text-center max-w-3xl mx-auto mb-12">
//             <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-sm font-medium mb-3">
//               Our Purpose
//             </span>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
//               Nurturing Hearts, Minds, and Souls
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 md:text-lg">
//               Discover our commitment to excellence in education and community service.
//             </p>
//           </div>
//           <div className="mb-12">
//             <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200 dark:border-gray-700">
//               {["mission", "vision", "values"].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab as "mission" | "vision" | "values")}
//                   className={`px-6 py-3 text-lg font-medium transition-colors ${
//                     activeTab === tab
//                       ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
//                       : "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
//                   }`}
//                 >
//                   {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                 </button>
//               ))}
//             </div>
//             {activeTab === "mission" && (
//               <div>
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//                   <motion.div
//                     initial={{ opacity: 0, x: -30 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     transition={{ duration: 0.8, ease: "easeOut" }}
//                     viewport={{ once: true, margin: "-100px" }}
//                   >
//                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//                       Our Mission
//                     </h3>
//                     <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
//                       Akode Islamic Centre (AIC) provides exceptional Islamic education and holistic student development while caring for orphans.
//                     </p>
//                     <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
//                       We integrate traditional Islamic knowledge with modern education to produce spiritually and academically accomplished graduates.
//                     </p>
//                     <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">
//                       Our orphan care supports over 450 children within their families, preserving essential bonds for their development.
//                     </p>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {[
//                         "Quran memorization and Islamic education",
//                         "Holistic academic development",
//                         "Family-centered orphan care",
//                         "Community service and leadership",
//                       ].map((item, index) => (
//                         <div key={index} className="flex items-start">
//                           <svg
//                             className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 mt-1"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M5 13l4 4L19 7"
//                             />
//                           </svg>
//                           <span className="text-gray-700 dark:text-gray-300">{item}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </motion.div>
//                   <motion.div
//                     initial={{ opacity: 0, x: 30 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     transition={{ duration: 0.8, ease: "easeOut" }}
//                     viewport={{ once: true, margin: "-100px" }}
//                     className="relative rounded-xl overflow-hidden shadow-xl"
//                   >
//                     <YoutubeEmbed
//                       videoId={process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID || "qCPvfZh2HoA"}
//                       title="Akode Islamic Centre: Our Mission & Vision"
//                       description="Learn about our commitment to Islamic education, orphan care, and community development"
//                       aspectRatio="16/9"
//                     />
//                   </motion.div>
//                 </div>
//               </div>
//             )}
//             {activeTab === "vision" && (
//               <div>
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//                   <motion.div
//                     initial={{ opacity: 0, x: 30 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     transition={{ duration: 0.8, ease: "easeOut" }}
//                     viewport={{ once: true, margin: "-100px" }}
//                     className="order-2 lg:order-1 relative rounded-xl overflow-hidden shadow-xl"
//                   >
//                     <div className="aspect-w-4 aspect-h-3 relative bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl overflow-hidden p-10">
//                       <div className="flex items-center justify-center h-full">
//                         <blockquote className="italic text-white text-lg md:text-xl font-medium text-center leading-relaxed">
//                           "We envision a community where every individual accesses quality education, orphans thrive in families, and graduates lead with compassion."
//                           <footer className="mt-4 text-indigo-200 font-normal text-base">
//                             — Sheikh Ahmed Qasim, Founder
//                           </footer>
//                         </blockquote>
//                       </div>
//                     </div>
//                   </motion.div>
//                   <motion.div
//                     initial={{ opacity: 0, x: -30 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     transition={{ duration: 0.8, ease: "easeOut" }}
//                     viewport={{ once: true, margin: "-100px" }}
//                     className="order-1 lg:order-2"
//                   >
//                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//                       Our Vision for the Future
//                     </h3>
//                     <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
//                       By 2030, we aim to educate 10,000 students annually with personalized, high-quality programs.
//                     </p>
//                     <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
//                       We plan to establish an Islamic university offering specialized programs in Islamic studies and modern fields.
//                     </p>
//                     <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
//                       Our orphan care model will inspire regional adoption, prioritizing family-centered support.
//                     </p>
//                     <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
//                       Digital initiatives will provide global access to our educational resources, especially for underserved communities.
//                     </p>
//                   </motion.div>
//                 </div>
//               </div>
//             )}
//             {activeTab === "values" && (
//               <motion.div
//                 initial="hidden"
//                 whileInView="visible"
//                 viewport={{ once: true, margin: "-100px" }}
//                 variants={containerVariants}
//                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
//               >
//                 {values.map((value, index) => (
//                   <motion.div
//                     key={index}
//                     variants={itemVariants}
//                     className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
//                   >
//                     <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-2xl mb-4">
//                       {value.icon}
//                     </div>
//                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
//                     <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{value.description}</p>
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* History Timeline */}
//       <section className="py-20 px-6 bg-indigo-50 dark:bg-gray-800 relative overflow-hidden">
//         <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-gray-50 dark:from-gray-900 to-transparent z-10"></div>
//         <div className="absoluteinset-0 opacity-5 dark:opacity-10 pointer-events-none">
//           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
//             <defs>
//               <pattern id="timeline-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
//                 <circle cx="20" cy="20" r="1" fill="currentColor" />
//               </pattern>
//             </defs>
//             <rect width="100%" height="100%" fill="url(#timeline-pattern)" />
//           </svg>
//         </div>
//         <div className="container mx-auto max-w-6xl relative z-20">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true, margin: "-100px" }}
//             className="text-center mb-16"
//           >
//             <span className="inline-block p-2 px-5 bg-purple-100 dark:bg-purple-900/50 rounded-full text-purple-800 dark:text-purple-300 font-medium text-sm mb-3">
//               Our Journey
//             </span>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
//               Key Milestones
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
//               A 25-year journey of education, welfare, and cultural impact.
//             </p>
//           </motion.div>
//           <div className="relative">
//             <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-indigo-300 dark:bg-indigo-700"></div>
//             <div className="space-y-20">
//               {milestones.map((milestone, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 30 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.7, delay: index * 0.1 }}
//                   viewport={{ once: true, margin: "-50px" }}
//                   className={`flex flex-col md:flex-row ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center`}
//                 >
//                   <div className="md:w-1/2"></div>
//                   <div className="hidden md:flex items-center justify-center">
//                     <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white flex items-center justify-center z-10 text-2xl font-bold shadow-lg">
//                       {milestone.icon}
//                     </div>
//                   </div>
//                   <div className="md:w-1/2 bg-white dark:bg-gray-700 p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-600">
//                     <div className="md:hidden flex justify-center mb-4">
//                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white flex items-center justify-center text-xl font-bold shadow-lg">
//                         {milestone.icon}
//                       </div>
//                     </div>
//                     <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 font-medium rounded-full mb-3">
//                       {milestone.year}
//                     </span>
//                     <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
//                       {milestone.title}
//                     </h3>
//                     <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
//                       {milestone.description}
//                     </p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Team Section */}
//       <section className="py-20 px-6 bg-white dark:bg-gray-900">
//         <div className="container mx-auto max-w-6xl">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true, margin: "-100px" }}
//             className="text-center mb-16"
//           >
//             <span className="inline-block p-2 px-5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-800 dark:text-indigo-300 font-medium text-sm mb-3">
//               Our Team
//             </span>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
//               The Heart of AIC
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
//               Meet the passionate individuals driving our mission.
//             </p>
//           </motion.div>
//           <motion.div
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, margin: "-50px" }}
//           >
//             {team.map((member, index) => (
//               <motion.div
//                 key={index}
//                 variants={itemVariants}
//                 className="group bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
//               >
//                 <div className="relative h-72 w-full overflow-hidden">
//                   <Image
//                     src={member.image}
//                     alt={member.name}
//                     fill
//                     className="object-cover transition-transform duration-500 group-hover:scale-105"
//                     loading="lazy"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
//                 </div>
//                 <div className="p-6">
//                   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
//                     {member.name}
//                   </h3>
//                   <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">{member.position}</p>
//                   <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{member.bio}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       {/* Institutes Section */}
//       <section className="py-20 px-6 bg-indigo-50 dark:bg-gray-800">
//         <div className="container mx-auto max-w-6xl">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true, margin: "-100px" }}
//             className="text-center mb-16"
//           >
//             <span className="inline-block p-2 px-5 bg-purple-100 dark:bg-purple-900/50 rounded-full text-purple-800 dark:text-purple-300 font-medium text-sm mb-3">
//               Our Institutes
//             </span>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
//               Educational Excellence
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
//               Explore our six institutes fostering Islamic education and academic success.
//             </p>
//           </motion.div>
//           <motion.div
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, margin: "-50px" }}
//           >
//             {institutes.map((institute, index) => (
//               <motion.div
//                 key={index}
//                 variants={itemVariants}
//                 className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-600 hover:border-indigo-200 dark:hover:border-indigo-700"
//               >
//                 <div className="flex items-center mb-6">
//                   <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-2xl mr-4 shadow-sm">
//                     {institute.icon}
//                   </div>
//                   <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
//                     {institute.name}
//                   </h3>
//                 </div>
//                 <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{institute.desc}</p>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="py-20 px-6 bg-white dark:bg-gray-900 relative overflow-hidden">
//         <div className="absolute inset-0 opacity-5 dark:opacity-5 pointer-events-none">
//           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
//             <defs>
//               <pattern id="quote-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
//                 <path d="M25 10L10 25L25 40L40 25z" fill="currentColor" opacity="0.5" />
//               </pattern>
//             </defs>
//             <rect width="100%" height="100%" fill="url(#quote-pattern)" />
//           </svg>
//         </div>
//         <div className="container mx-auto max-w-6xl relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true, margin: "-100px" }}
//             className="text-center mb-16"
//           >
//             <span className="inline-block p-2 px-5 bg-green-100 dark:bg-green-900/50 rounded-full text-green-800 dark:text-green-300 font-medium text-sm mb-3">
//               Testimonials
//             </span>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
//               Community Voices
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
//               Stories of transformation through AIC’s education and support.
//             </p>
//           </motion.div>
//           <motion.div
//             className="grid grid-cols-1 md:grid-cols-2 gap-8"
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, margin: "-50px" }}
//           >
//             {testimonials.map((testimonial, index) => (
//               <motion.div
//                 key={index}
//                 variants={itemVariants}
//                 className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-md relative border border-gray-100 dark:border-gray-700"
//               >
//                 <div className="absolute top-0 left-10 transform -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center shadow-md">
//                   <svg
//                     className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
//                   </svg>
//                 </div>
//                 <p className="text-gray-600 dark:text-gray-300 mb-8 mt-6 italic leading-relaxed text-lg">
//                   {testimonial.quote}
//                 </p>
//                 <div className="flex items-center">
//                   <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-white dark:border-gray-600 shadow-sm">
//                     <Image
//                       src={testimonial.image}
//                       alt={testimonial.author}
//                       fill
//                       className="object-cover"
//                       loading="lazy"
//                     />
//                   </div>
//                   <div>
//                     <h4 className="font-bold text-gray-900 dark:text-white text-lg">{testimonial.author}</h4>
//                     <p className="text-gray-500 dark:text-gray-400">{testimonial.role}</p>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       {/* Map & Location Section */}
//       <section className="py-20 px-6 bg-indigo-50 dark:bg-gray-800">
//         <div className="container mx-auto max-w-6xl">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true, margin: "-100px" }}
//             className="text-center mb-16"
//           >
//             <span className="inline-block p-2 px-5 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 font-medium text-sm mb-3">
//               Visit Us
//             </span>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
//               Our Location
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
//               Visit our campus to experience our educational environment.
//             </p>
//           </motion.div>
//           <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
//             <motion.div
//               initial={{ opacity: 0, x: -30 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6 }}
//               viewport={{ once: true, margin: "-100px" }}
//               className="lg:col-span-2 bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-600"
//             >
//               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
//                 Contact Information
//               </h3>
//               <div className="space-y-6">
//                 <div className="flex items-start">
//                   <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">Address</h4>
//                     <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
//                       Akode Islamic Centre,
//                       <br />
//                       Oorkadavu, Kozhikode,
//                       <br />
//                       Kerala, India - 673014
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-start">
//                   <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">Phone</h4>
//                     <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
//                       <a
//                         href="tel:+914952482555"
//                         className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
//                       >
//                         +91 495 2482 555
//                       </a>
//                       <br />
//                       <a
//                         href="tel:+919846123456"
//                         className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
//                       >
//                         +91 9846 123456
//                       </a>
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-start">
//                   <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">Email</h4>
//                     <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
//                       <a
//                         href="mailto:info@akodeislamiccentre.org"
//                         className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
//                       >
//                         info@akodeislamiccentre.org
//                       </a>
//                       <br />
//                       <a
//                         href="mailto:director@akodeislamiccentre.org"
//                         className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
//                       >
//                         director@akodeislamiccentre.org
//                       </a>
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-start">
//                   <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">Office Hours</h4>
//                     <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
//                       Monday - Saturday: 9:00 AM - 5:00 PM
//                       <br />
//                       Friday: 9:00 AM - 12:00 PM, 2:00 PM - 5:00 PM
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
//                 <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-3">Connect With Us</h4>
//                 <div className="flex space-x-4">
//                   {["facebook", "twitter", "instagram", "youtube"].map((social, index) => (
//                     <a
//                       key={index}
//                       href={`https://${social}.com`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
//                     >
//                       <svg
//                         className="w-5 h-5"
//                         fill="currentColor"
//                         viewBox="0 0 24 24"
//                         xmlns="http://www.w3.org/2000/svg"
//                       >
//                         <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" />
//                       </svg>
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             </motion.div>
//             <motion.div
//               initial={{ opacity: 0, x: 30 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6 }}
//               viewport={{ once: true, margin: "-100px" }}
//               className="lg:col-span-3 bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-600 h-full min-h-[400px]"
//             >
//               <div className="relative w-full h-full min-h-[400px] bg-gray-100 dark:bg-gray-800">
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 p-6 rounded-lg shadow-lg text-center">
//                     <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
//                       Interactive Map Coming Soon
//                     </h4>
//                     <p className="text-gray-600 dark:text-gray-300 mb-4">
//                       We’re integrating an interactive map. Find us using the address or click below.
//                     </p>
//                     <Link
//                       href="https://maps.google.com"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
//                     >
//                       <svg
//                         className="w-5 h-5 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                         xmlns="http://www.w3.org/2000/svg"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                         />
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                         />
//                       </svg>
//                       Open in Google Maps
//                     </Link>
//                   </div>
//                 </div>
//                 <div className="absolute inset-0 pointer-events-none opacity-30">
//                   <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
//                     <defs>
//                       <pattern id="grid-pattern" width="50" height="50" patternUnits="userSpaceOnUse">
//                         <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" />
//                       </pattern>
//                     </defs>
//                     <rect width="100%" height="100%" fill="url(#grid-pattern)" />
//                   </svg>
//                   <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full border-4 border-indigo-500 animate-ping opacity-30"></div>
//                   <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-indigo-600"></div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* FAQ Section */}
//       <section className="py-20 px-6 bg-white dark:bg-gray-900">
//         <div className="container mx-auto max-w-4xl">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true, margin: "-100px" }}
//             className="text-center mb-16"
//           >
//             <span className="inline-block p-2 px-5 bg-amber-100 dark:bg-amber-900/50 rounded-full text-amber-800 dark:text-amber-300 font-medium text-sm mb-3">
//               FAQs
//             </span>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
//               Frequently Asked Questions
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
//               Answers to common questions about our programs and initiatives.
//             </p>
//           </motion.div>
//           <div className="space-y-6">
//             {[
//               {
//                 question: "How can I enroll my child in one of your programs?",
//                 answer:
//                   "Enrollment opens annually. Visit our campus for application forms or contact our admissions team via email or phone to schedule an appointment.",
//               },
//               {
//                 question: "What is the process for supporting an orphan through your program?",
//                 answer:
//                   "Donors can sponsor orphans monthly, covering education, healthcare, and needs. We provide updates and facilitate communication. Contact our Community Welfare office for details.",
//               },
//               {
//                 question: "Do you offer scholarships for students from low-income families?",
//                 answer:
//                   "Yes, need-based scholarships cover partial or full tuition, prioritized for orphans and single-parent families. Apply at the academic year’s start.",
//               },
//               {
//                 question: "What is your approach to balancing Islamic and modern education?",
//                 answer:
//                   "Our curriculum integrates Quranic studies and Islamic sciences with math, sciences, and technology to develop spiritually grounded, modern professionals.",
//               },
//               {
//                 question: "Can international students apply to your programs?",
//                 answer:
//                   "Yes, international students are welcome, particularly for higher education programs. We assist with visas and accommodation. Contact us for guidance.",
//               },
//               {
//                 question: "Do you offer adult education or weekend programs?",
//                 answer:
//                   "We offer part-time Quranic classes, evening lectures, and workshops for adults. Check our events calendar or contact us for schedules.",
//               },
//             ].map((faq, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 viewport={{ once: true, margin: "-50px" }}
//                 className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
//               >
//                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{faq.question}</h3>
//                 <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
//               </motion.div>
//             ))}
//           </div>
//           <div className="mt-12 text-center">
//             <p className="text-gray-600 dark:text-gray-400 mb-6">Have more questions? Reach out directly.</p>
//             <Link
//               href="/contact"
//               className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
//             >
//               <svg
//                 className="w-5 h-5 mr-2"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
//                 />
//               </svg>
//               Contact Us
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section
//         id="donation"
//         className="py-24 px-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white relative overflow-hidden"
//       >
//         <div className="absolute inset-0 opacity-10 pointer-events-none">
//           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
//             <defs>
//               <pattern id="enhanced-cta-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
//                 <path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke="currentColor" strokeWidth="1" />
//               </pattern>
//             </defs>
//             <rect width="100%" height="100%" fill="url(#enhanced-cta-pattern)" />
//           </svg>
//         </div>
//         <motion.div
//           className="absolute top-20 left-20 w-20 h-20 rounded-full bg-white opacity-10"
//           animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
//           transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
//         />
//         <motion.div
//           className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-purple-500 opacity-10"
//           animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }}
//           transition={{ duration: 7, repeat: Infinity, repeatType: "reverse" }}
//         />
//         <div className="container mx-auto max-w-6xl relative z-10">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-12">
//             <div className="md:w-2/3">
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.8, ease: "easeOut" }}
//                 viewport={{ once: true, margin: "-100px" }}
//               >
//                 <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Support AIC</h2>
//                 <p className="text-xl text-indigo-100 mb-8 max-w-xl leading-relaxed">
//                   Your donations educate students and support over 450 orphans, building a brighter future.
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
//                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
//                     <h3 className="text-2xl font-bold mb-1">₹1,000</h3>
//                     <p className="text-indigo-100 text-sm">Monthly support for one orphan</p>
//                   </div>
//                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
//                     <h3 className="text-2xl font-bold mb-1">₹5,000</h3>
//                     <p className="text-indigo-100 text-sm">One month of Hifz program</p>
//                   </div>
//                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
//                     <h3 className="text-2xl font-bold mb-1">₹25,000</h3>
//                     <p className="text-indigo-100 text-sm">Semester of higher education</p>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
//               viewport={{ once: true, margin: "-100px" }}
//               className="md:w-1/3 bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-xl"
//             >
//               <h3 className="text-2xl font-bold mb-6 text-center">Make a Difference</h3>
//               <div className="space-y-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium">Donation Amount</label>
//                   <div className="grid grid-cols-3 gap-2 mb-2">
//                     {["₹1,000", "₹5,000", "₹10,000"].map((amount, i) => (
//                       <button
//                         key={i}
//                         className="bg-white/20 hover:bg-white/30 py-2 rounded-lg transition-colors text-sm"
//                       >
//                         {amount}
//                       </button>
//                     ))}
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Other Amount"
//                     className="w-full bg-white/20 border border-white/30 rounded-lg py-2 px-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Donation Type</label>
//                   <select className="w-full bg-white/20 border border-white/30 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/30">
//                     <option>One-time Donation</option>
//                     <option>Monthly Sponsorship</option>
//                     <option>Yearly Commitment</option>
//                   </select>
//                 </div>
//                 <Link
//                   href="/donation"
//                   className="block w-full bg-white hover:bg-indigo-50 text-indigo-700 font-bold py-3 rounded-lg text-center transition-colors shadow-lg"
//                 >
//                   Donate Now
//                 </Link>
//                 <p className="text-xs text-center text-indigo-100">
//                   All donations are tax-deductible. Receipts provided.
//                 </p>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Affiliations Section */}
//       <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
//         <div className="container mx-auto max-w-6xl">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true, margin: "-100px" }}
//             className="text-center mb-12"
//           >
//             <span className="inline-block p-2 px-5 bg-teal-100 dark:bg-teal-900/50 rounded-full text-teal-800 dark:text-teal-300 font-medium text-sm mb-3">
//               Recognition
//             </span>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
//               Affiliations & Recognitions
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
//               Collaborating with respected institutions for excellence.
//             </p>
//           </motion.div>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
//             {Array(8)
//               .fill(0)
//               .map((_, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5, delay: index * 0.05 }}
//                   viewport={{ once: true, margin: "-50px" }}
//                   className="flex flex-col items-center"
//                 >
//                   <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-lg shadow-md flex items-center justify-center mb-3">
//                     <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded"></div>
//                   </div>
//                   <p className="text-gray-700 dark:text-gray-300 text-center font-medium">
//                     Partner Organization {index + 1}
//                   </p>
//                 </motion.div>
//               ))}
//           </div>
//         </div>
//       </section>

//       {/* Newsletter Section */}
//       <section className="py-16 px-6 bg-indigo-900 text-white">
//         <div className="container mx-auto max-w-4xl">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-indigo-800/50 rounded-2xl p-8 border border-indigo-700">
//             <div className="md:w-2/3">
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.6 }}
//                 viewport={{ once: true, margin: "-100px" }}
//               >
//                 <h3 className="text-2xl font-bold mb-2">Stay Connected</h3>
//                 <p className="text-indigo-200 mb-4">Subscribe for updates on programs and success stories.</p>
//               </motion.div>
//             </div>
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6, delay: 0.1 }}
//               viewport={{ once: true, margin: "-100px" }}
//               className="md:w-1/3 w-full"
//             >
//               <div className="flex flex-col sm:flex-row gap-2">
//                 <input
//                   type="email"
//                   placeholder="Your email address"
//                   className="px-4 py-3 bg-white/10 border border-indigo-600 rounded-lg text-white placeholder-indigo-300 flex-grow focus:outline-none focus:ring-2 focus:ring-white/30"
//                 />
//                 <button className="px-5 py-3 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap">
//                   Subscribe
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="pt-20 pb-12 px-6 bg-gray-900 text-gray-400">
//         <div className="container mx-auto max-w-6xl">
//           <div className="flex justify-center mb-16">
//             <button
//               onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg hover:shadow-xl group"
//             >
//               <svg
//                 className="w-5 h-5 transform group-hover:-translate-y-1 transition-transform"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
//               </svg>
//               Back to Top
//             </button>
//           </div>
//           <div className="text-center">
//             <p className="mb-6">© {new Date().getFullYear()} Akode Islamic Centre. All rights reserved.</p>
//             <div className="flex justify-center space-x-4 mb-6">
//               <Link href="/privacy-policy" className="hover:text-white transition-colors">
//                 Privacy Policy
//               </Link>
//               <Link href="/terms" className="hover:text-white transition-colors">
//                 Terms of Service
//               </Link>
//               <Link href="/sitemap" className="hover:text-white transition-colors">
//                 Sitemap
//               </Link>
//             </div>
//             <p className="text-sm">Designed for the Akode Islamic Centre community.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }