'use client'
import { useState } from 'react';
import { speak } from "@/function/voiceover"; // Import the speak function from the API route

export default function ToggleSwitch({ label = "Settings", onToggle }) {
  const [isOn, setIsOn] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("umbriel")
  const voiceOption = ["MALE", "FEMALE"]

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) onToggle(newState); // Send state back to parent if needed
  };

  const handleChnge = (e) => {
    const voice = e.target.value;
    setSelectedVoice(voice);
    speak("Voice changed to " + voice, voice, isOn); // Call the speak function with the new voice
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-xs absolute z-10 top-4 right-4">
      <div className="flex justify-between items-center w-full">
        <span className="text-sm font-semibold text-gray-700">AI VOICE <span className="text-red-500 text-[12px]">*COMING SOON*</span></span>
        
        <button
          onClick={handleToggle}
          disabled
          aria-checked={isOn}
          role="switch"
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
            isOn ? 'bg-blue-600' : 'bg-gray-400'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isOn ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      
      <div className="voice flex items-center justify-between w-full mt-4">
        <span className="text-sm font-semibold text-gray-700">VOICE</span>
        <select className="border-2 border-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2" value={selectedVoice} onChange={handleChnge}>
          {voiceOption.map((voice) => (
            <option key={voice} value={voice}>{voice.toUpperCase()}</option>
          ))}
        </select>
      </div>
      
    </div>
  );
}