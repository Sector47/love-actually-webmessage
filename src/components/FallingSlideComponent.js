// src/components/FallingSlideComponent.js
import React, { useEffect } from 'react';
import './FallingSlideComponent.css';

const FallingSlideComponent = ({ slide, fallClass, initialPosition, initialRotation }) => {
  const SlideComponent = slide;

  useEffect(() => {
    console.log("FallingSlideComponent created at position:", initialPosition);
  }, [initialPosition]);

  return (
    <div
      className={`falling-slide ${fallClass}`}
      style={{
        transform: `translate(${initialPosition.x}px, ${initialPosition.y}px) rotate(${initialRotation}deg)`,
      }}
    >
      <SlideComponent />
    </div>
  );
};

export default FallingSlideComponent;
