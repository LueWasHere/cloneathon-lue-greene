from google import genai
from google.genai import types
import wave
import speech_recognition as sr
import pygame
import threading
import time
import os
import uuid
import re

class VoiceChat:
    def __init__(self, api_key):
        self.client = genai.Client(api_key=api_key)
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Initialize pygame mixer for audio playback
        pygame.mixer.init(frequency=24000, size=-16, channels=1, buffer=1024)
        
        # Conversation history for context
        self.conversation_history = []
        
        print("Initializing microphone...")
        # Calibrate microphone for ambient noise
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)
        print("Voice chat ready! Say something...")

    def wave_file(self, filename, pcm, channels=1, rate=24000, sample_width=2):
        """Save PCM data as a WAV file"""
        with wave.open(filename, "wb") as wf:
            wf.setnchannels(channels)
            wf.setsampwidth(sample_width)
            wf.setframerate(rate)
            wf.writeframes(pcm)

    def listen_for_speech(self):
        """Listen for speech input from microphone"""
        try:
            print("Listening...")
            with self.microphone as source:
                audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=5)
            print("Processing speech...")
            text = self.recognizer.recognize_google(audio)
            print(f"You said: {text}")
            return text
        except sr.WaitTimeoutError:
            return None
        except sr.UnknownValueError:
            print("Could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"Error with speech recognition service: {e}")
            return None

    def generate_text_response(self, user_input):
        """Generate text response using Gemini 2.5 Flash"""
        context = "\n".join(self.conversation_history[-6:])  # Keep last 6 exchanges
        prompt = f"{context}\nUser: {user_input}\nAI:"
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            response_text = response.candidates[0].content.parts[0].text
            return response_text.strip()
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                print("Rate limit exceeded for text generation. Please wait...")
                time.sleep(10)
                return "I'm experiencing some delays. Please try again."
            else:
                print(f"Error generating text response: {e}")
                return "I'm having trouble responding right now."

    def text_to_speech(self, text):
        """Convert text to speech using Gemini 2.5 Flash TTS"""
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-preview-tts",
                contents=text,
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name='Kore',
                            )
                        )
                    ),
                )
            )
            audio_data = response.candidates[0].content.parts[0].inline_data.data
            return audio_data
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                print("Rate limit exceeded for TTS. Please wait a moment...")
                delay_match = re.search(r"retryDelay.*?(\d+)s", error_msg)
                if delay_match:
                    delay = int(delay_match.group(1))
                    print(f"Waiting {delay} seconds as suggested by API...")
                    time.sleep(delay)
                else:
                    print("Waiting 30 seconds before continuing...")
                    time.sleep(30)
            else:
                print(f"Error generating speech: {e}")
            return None

    def generate_response(self, user_input):
        """Generate AI response using Gemini 2.5 Flash for text, then TTS"""
        self.conversation_history.append(f"User: {user_input}")
        
        print("Generating text response...")
        response_text = self.generate_text_response(user_input)
        if not response_text:
            return None, None
        
        self.conversation_history.append(f"AI: {response_text}")
        
        print("Converting to speech...")
        audio_data = self.text_to_speech(response_text)
        return audio_data, response_text

    def play_audio(self, audio_data):
        """Play audio response"""
        temp_file = None
        try:
            temp_file = f"temp_response_{uuid.uuid4().hex[:8]}.wav"
            self.wave_file(temp_file, audio_data)
            
            pygame.mixer.music.stop()
            pygame.mixer.music.load(temp_file)
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
        except Exception as e:
            print(f"Error playing audio: {e}")
        finally:
            if temp_file and os.path.exists(temp_file):
                for attempt in range(3):
                    try:
                        pygame.mixer.music.unload()
                        time.sleep(0.1)
                        os.remove(temp_file)
                        break
                    except (OSError, PermissionError):
                        if attempt < 2:
                            time.sleep(0.5)
                        else:
                            print(f"Warning: Could not delete temporary file {temp_file}")

    def start_conversation(self):
        """Main conversation loop"""
        print("\n=== Voice Chat Started ===")
        print("Say something to start the conversation!")
        print("Say 'quit', 'exit', or 'stop' to end the chat.")
        print("=" * 30)
        
        while True:
            user_input = self.listen_for_speech()
            if user_input is None:
                continue
            if user_input.lower() in ['quit', 'exit', 'stop', 'goodbye']:
                print("Ending conversation. Goodbye!")
                break
            print("Generating response...")
            audio_data, response_text = self.generate_response(user_input)
            if audio_data is None:
                print("Failed to generate response. Please try again.")
                continue
            print(f"AI: {response_text}")
            print("Playing response...")
            self.play_audio(audio_data)
            print("\nReady for next input...")

def main():
    # Replace with your actual Gemini API key
    API_KEY = "AIzaSyAyALj8hOdidCAZDy0EFNYGP2GK21iCos8"
    
    if API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        print("Please set your Gemini API key in the API_KEY variable")
        return
    
    try:
        chat = VoiceChat(API_KEY)
        chat.start_conversation()
    except KeyboardInterrupt:
        print("\nChat interrupted by user.")
    except Exception as e:
        print(f"Error starting voice chat: {e}")

if __name__ == "__main__":
    main()
