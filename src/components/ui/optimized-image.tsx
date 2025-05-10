import React from 'react';
import LazyLoad from 'react-lazyload';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width = 800,
  height = 600,
  priority = false,
}) => {
  return (
    <div className={`relative ${className}`}>
      <LazyLoad
        height={height}
        offset={100}
        once={true}
        placeholder={<div className="w-full h-full bg-gray-200 animate-pulse" />}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{ width: width, height: height }}
          loading={priority ? 'eager' : 'lazy'}
        />
      </LazyLoad>
    </div>
  );
};

export default OptimizedImage;
