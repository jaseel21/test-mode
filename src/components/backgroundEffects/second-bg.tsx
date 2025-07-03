import React from 'react';

const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Purple Circle */}
      <div className="absolute w-[40vw] h-[40vw] bg-purple-600/30 rounded-full 
        -top-[20%] -left-[10%] blur-[100px] animate-pulse-slow"/>

      {/* Blue Circle */}
      <div className="absolute w-[35vw] h-[35vw] bg-blue-500/20 rounded-full 
        top-[60%] -right-[10%] blur-[90px] animate-float"/>

      {/* Pink Circle */}
      <div className="absolute w-[45vw] h-[45vw] bg-pink-500/20 rounded-full 
        top-[30%] left-[20%] blur-[120px] animate-float-slow"/>

      {/* Teal Accent */}
      <div className="absolute w-[25vw] h-[25vw] bg-teal-400/20 rounded-full 
        -bottom-[10%] left-[10%] blur-[80px] animate-pulse"/>
    </div>
  );
};

export default BackgroundEffects;