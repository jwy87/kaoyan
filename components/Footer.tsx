import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="absolute bottom-4 w-full text-center text-gray-500/60 text-xs z-10 font-light">
      <p>© {new Date().getFullYear()} 考研上岸许愿池</p>
    </footer>
  );
};

export default Footer;