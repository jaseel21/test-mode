import React from 'react';

const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Emerald Green Circle */}
      <div className="absolute w-[40vw] h-[40vw] bg-emerald-500/30 rounded-full 
        -top-[20%] -left-[10%] blur-[100px] animate-pulse-slow"/>
      
      {/* Sage Green Circle */}
      <div className="absolute w-[35vw] h-[35vw] bg-green-400/20 rounded-full 
        top-[60%] -right-[10%] blur-[90px] animate-float"/>
      
      {/* Mint Green Circle */}
      <div className="absolute w-[45vw] h-[45vw] bg-emerald-300/20 rounded-full 
        top-[30%] left-[20%] blur-[120px] animate-float-slow"/>
      
      {/* Teal-Green Accent */}
      <div className="absolute w-[25vw] h-[25vw] bg-teal-500/20 rounded-full 
        -bottom-[10%] left-[10%] blur-[80px] animate-pulse"/>
    </div>
  );
};

export default BackgroundEffects;