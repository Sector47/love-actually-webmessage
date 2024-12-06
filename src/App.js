import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import FallingSlideComponent from './components/FallingSlideComponent';
import BlankSlide from './slides/BlankSlide'; // Import the blank slide
import './App.css';

// Import slides that match the pattern Slide#.js
const context = require.context('./slides', false, /Slide\d+\.js$/);
const importSlides = () => {
  const slides = context.keys().map((key) => {
    const slideNumber = parseInt(key.match(/Slide(\d+)\.js$/)[1], 10); // Extract the numeric part of the file name
    return { slideNumber, component: context(key) };
  });

  slides.sort((a, b) => a.slideNumber - b.slideNumber); // Sort slides by their numeric value

  slides.forEach(({ slideNumber, component }, index) => {
    console.log(`Loaded slide ${index + 1}: Slide${slideNumber}.js`);
  });

  return slides.map(({ component }) => component); // Return the sorted components
};

const slides = importSlides();
slides.push({ default: BlankSlide }); // Add the blank slide as the last slide
console.log("Added blank slide as the last slide");

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fallingSlide, setFallingSlide] = useState(null);
  const [fallClass, setFallClass] = useState('');
  const [rotation, setRotation] = useState(0);
  const [releasePosition, setReleasePosition] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showNext, setShowNext] = useState(true);
  const [muted, setMuted] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('/media/images/stickfigure.png'); // Initial background image
  const audioRef = useRef(new Audio('/media/music/sayitscarolers.mp3')); // Update path to match the location in public directory
  const draggableRef = useRef(null); // Create a ref for the draggable element

  useEffect(() => {
    if (fallingSlide) {
      const timer = setTimeout(() => {
        setFallClass('');
        setFallingSlide(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [fallingSlide]);

  useEffect(() => {
    audioRef.current.loop = true; // Set the audio to loop
    if (currentSlide > 0) {
      console.log("Current slide index:", currentSlide);
      if (audioRef.current.paused) {
        audioRef.current.play().then(() => {
          console.log("Audio playing");
        }).catch((error) => {
          console.error("Audio play failed:", error);
        });
      }
    }
  }, [currentSlide]);

  const toggleMute = () => {
    if (audioRef.current.muted) {
      audioRef.current.muted = false;
      setMuted(false);
      console.log("Audio unmuted");
    } else {
      audioRef.current.muted = true;
      setMuted(true);
      console.log("Audio muted");
    }
  };

  const resetSlides = () => {
    console.log("Resetting slides to the first one");
    setCurrentSlide(0);
    console.log("Set currentSlide to:", 0);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setShowNext(true);
    setBackgroundImage('/media/images/stickfigure.png'); // Reset to initial background image
  };

  const nextSlide = () => {
    console.log("Current slide index before next:", currentSlide);
    if (currentSlide + 1 < slides.length) {
      setCurrentSlide((prev) => {
        const newSlide = prev + 1;
        console.log("Set currentSlide to:", newSlide);
        return newSlide;
      });
      console.log("Moved to next slide");
    } else {
      setShowNext(false);
      console.log("No more slides to show");
      
    }
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const onStart = () => {
    console.log("Dragging started");
    if (draggableRef.current) {
      draggableRef.current.classList.add('dragging');
    }
  };

  const onStop = (e, data) => {
    console.log("Position on release:", { x: data.x, y: data.y });

    if (draggableRef.current) {
      draggableRef.current.classList.remove('dragging');
    }

    if (Math.abs(data.x) > 0) {
      const newPosition = { x: data.x, y: data.y };
      const newRotation = data.x * 0.1;

      console.log("New release position:", newPosition);
      setReleasePosition(newPosition); // Capture the release position
      setRotation(newRotation);

      const fallingSlide = slides[currentSlide].default;
      setFallingSlide(() => fallingSlide);
      setFallClass(data.x > 150 ? 'fall-right' : 'fall-left');
      console.log("Set falling slide and class");

      if (currentSlide + 1 < slides.length - 1) { // Update condition to exclude blank slide
        nextSlide(); // Immediately set the next slide if there are more slides
      } else {
        setShowNext(false);
        setBackgroundImage('/media/images/stickfigurenohands.png'); // Change to final background image
        console.log("Reached last slide");
      }
    } else {
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  };

  const onDrag = (e, data) => {
    console.log("Dragging with position:", { x: data.x, y: data.y });
    setRotation(data.x * 0.1);
    setPosition({ x: data.x, y: data.y });
  };

  const SlideComponent = showNext && currentSlide < slides.length - 1 ? slides[currentSlide].default : null;
  const NextSlideComponent = showNext && currentSlide + 1 < slides.length - 1 ? slides[currentSlide + 1].default : null;

  return (
    <div className="App">
      <div className="controls">
        <button className="reset-button" onClick={resetSlides}>Reset</button>
        <button className="mute-button" onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
      </div>
      <div className="background" style={{ backgroundImage: `url(${backgroundImage})` }}>
        {fallingSlide && (
          <FallingSlideComponent
            slide={fallingSlide}
            fallClass={fallClass}
            initialPosition={releasePosition} // Use the release position here
            initialRotation={rotation}
          />
        )}
        {showNext && NextSlideComponent && (
          <div className="next-slide">
            <NextSlideComponent />
          </div>
        )}
        {showNext && (
          <Draggable
            nodeRef={draggableRef} // Pass the ref to the Draggable component
            onStart={onStart}
            onStop={onStop}
            onDrag={onDrag}
            position={position}
            bounds="parent"
          >
            <div
              ref={draggableRef} // Assign the ref to the draggable element
              className="draggable"
              style={{ transform: `rotate(${rotation}deg)`, zIndex: 2 }}
            >
              {SlideComponent && <SlideComponent />}
            </div>
          </Draggable>
        )}
      </div>
    </div>
  );
}

export default App;
