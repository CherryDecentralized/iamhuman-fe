import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Define the sentences
const sentences = [
  'No more politicians creating war between us',
  'No more capitalists enslaving us',
  'No more communism un-individualizing us',
  'We Want Peace',
  'This is our planet',
  "We’re taking it back.",
  'We Are Humans',
];

// Create keyframes for fading in and out
const fadeInOut = keyframes`
  0% {
    opacity: 0;
  }
  25% {
    opacity: 0.8;
  }
  75% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
`;
const Sentence = styled.div`
  @media (min-width: 768px) {
    display:block;
    z-index: 12;
    color: rgba(255, 255, 255, 0.80);
    align-items: center;
    text-align: center;
    font-size: 2.89188rem;
    width: 84.8rem;
    animation: ${fadeInOut} 12s ease-in-out infinite;
  }
  @media (max-width: 768px) {
    z-index: 12;
    color: rgba(255, 255, 255, 0.80);
    align-items: center;
    text-align: center;
    width: 20rem;
    animation: ${fadeInOut} 12s ease-in-out infinite;
    height: 5rem;
  }
`;

const Speech: React.FC = () => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSentenceIndex((prevIndex) =>
        prevIndex === sentences.length - 1 ? 0 : prevIndex + 1
      );
    }, 12000);

    return () => clearInterval(interval);
  }, [currentSentenceIndex]);

  return <Sentence>{sentences[currentSentenceIndex]}</Sentence>;
};

export default Speech;
