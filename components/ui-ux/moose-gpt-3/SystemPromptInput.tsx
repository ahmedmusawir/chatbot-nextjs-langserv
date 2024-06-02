import { useTranslateLangs } from "@/contexts/TranslateContext";
import { FormEvent, useEffect, useState } from "react";

const SystemPromptInput = () => {
  const { systemInput, setSystemInput } = useTranslateLangs();

  const localStorageKey = "systemPromptInput"; // Key for localStorage

  useEffect(() => {
    // Check for saved input in localStorage when component mounts
    const savedInput = localStorage.getItem(localStorageKey);
    if (savedInput) {
      setSystemInput(savedInput);
    }
  }, [setSystemInput]);

  const handleChatSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem(localStorageKey, systemInput); // Save to localStorage
  };

  const resetTextArea = () => {
    setSystemInput(""); // Clear the input field after submission
  };

  return (
    <div className="w-full mt-3">
      <form onSubmit={handleChatSubmit} className="flex flex-col">
        <textarea
          value={systemInput}
          onChange={(e) => setSystemInput(e.target.value)}
          className="mb-5 h-96 p-5"
          placeholder="Type your message..."
          aria-label="Type your message"
        />
        <section className="flex mr-3">
          <button type="submit" className="btn w-[50%] mx-1" aria-label="Send">
            Save
          </button>
          <button
            type="button"
            className="btn btn-error w-[50%] mx-1"
            aria-label="Send"
            onClick={resetTextArea}
          >
            Clear
          </button>
        </section>
      </form>
      <p className="mt-12 font-bold">
        This app is NOT mobile responsive. So plz always use full screen view
        while testing. Don't have time for that crap right now ... sorry!
      </p>
    </div>
  );
};

export default SystemPromptInput;
