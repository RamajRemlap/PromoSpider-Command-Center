
export const speak = (text: string) => {
  if (!window.speechSynthesis) {
    console.warn("Speech synthesis not supported in this environment.");
    return;
  }
  
  // Cancel any existing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Attempt to select a clear, "system-like" voice
  const voices = window.speechSynthesis.getVoices();
  
  // Preference order for voices
  const preferredVoice = voices.find(v => 
    v.name.includes("Google US English") || 
    v.name.includes("Microsoft David") || 
    v.name.includes("Samantha")
  );

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};