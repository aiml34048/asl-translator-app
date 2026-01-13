# ASL Translator App 🤟

A real-time American Sign Language (ASL) translator mobile app that uses Google's Gemini Vision API to recognize ASL letters and words from your camera feed.

## Features ✨

- 📸 **Real-time Recognition** - Continuously captures and recognizes ASL signs
- 🔤 **Letters & Words** - Recognizes both fingerspelling (A-Z) and word signs
- 🔊 **Text-to-Speech** - Speaks out recognized signs automatically
- 📝 **History Tracking** - Keeps track of last 20 recognized signs
- 🎨 **Beautiful UI** - Modern, dark-themed interface
- 📱 **Cross-platform** - Works on iOS and Android

## Tech Stack 🛠️

- **React Native** with Expo
- **Gemini 2.0 Flash** - Google's multimodal AI for vision recognition
- **Expo Camera** - Camera access and photo capture
- **Expo Speech** - Text-to-speech functionality

## Prerequisites 📋

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Gemini API Key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Installation 🚀

1. **Clone the repository**
```bash
git clone https://github.com/aiml34048/asl-translator-app.git
cd asl-translator-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Add your Gemini API Key**

Open `App.js` and replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:

```javascript
const GEMINI_API_KEY = 'your-actual-api-key-here';
```

4. **Start the development server**
```bash
npm start
```

5. **Run on your device**
   - Install **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
   - Scan the QR code shown in terminal/browser
   - Or press `a` for Android emulator, `i` for iOS simulator

## Usage 📱

1. **Grant Camera Permission** - Allow the app to access your camera
2. **Position Your Hand** - Show ASL signs in front of the camera
3. **Start Recognition** - Tap "Start Recognition" button
4. **View Results** - Recognized signs appear in real-time with speech output
5. **Check History** - Scroll through previously recognized signs

## How It Works 🔍

1. **Camera Capture** - Front camera captures frames every 2 seconds
2. **Image Processing** - Images are resized and compressed for efficiency
3. **AI Recognition** - Gemini Vision API analyzes the image and identifies ASL signs
4. **Output** - Recognized text is displayed and spoken aloud
5. **History** - All recognized signs are logged with timestamps

## Configuration ⚙️

### Adjust Recognition Interval

In `App.js`, modify the interval (default: 2000ms):

```javascript
recognitionInterval.current = setInterval(() => {
  captureAndRecognize();
}, 2000); // Change this value (in milliseconds)
```

### Change Camera Quality

Adjust image quality in the `captureAndRecognize` function:

```javascript
const photo = await cameraRef.current.takePictureAsync({
  quality: 0.5, // 0.0 to 1.0 (lower = faster, higher = better quality)
  base64: true,
});
```

## Project Structure 📁

```
asl-translator-app/
├── App.js              # Main application component
├── app.json            # Expo configuration
├── package.json        # Dependencies
├── README.md           # This file
└── assets/             # App icons and images
```

## API Usage 💡

The app uses Gemini 2.0 Flash model with a specialized prompt:

```javascript
const prompt = `You are an ASL recognition expert. 
Analyze this image and identify the ASL sign being shown. 
- If it's a letter (fingerspelling), return just the letter (A-Z)
- If it's a word/phrase sign, return the word or phrase
- If no clear ASL sign is detected, return "No sign detected"
- Be concise, return ONLY the recognized sign, nothing else.`;
```

## Troubleshooting 🔧

### Camera Not Working
- Ensure camera permissions are granted
- Check if another app is using the camera
- Restart the Expo app

### API Errors
- Verify your Gemini API key is correct
- Check your internet connection
- Ensure you haven't exceeded API quota

### Recognition Issues
- Ensure good lighting conditions
- Position hand clearly in frame
- Try different angles
- Reduce recognition interval for faster processing

## Future Enhancements 🚀

- [ ] Support for more sign languages (BSL, ISL, etc.)
- [ ] Sentence formation from multiple signs
- [ ] Offline mode with local ML models
- [ ] Custom sign training
- [ ] Video recording and playback
- [ ] Multi-hand recognition
- [ ] Sign language learning mode

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments 🙏

- Google Gemini AI for powerful vision recognition
- Expo team for excellent mobile development tools
- ASL community for inspiration

## Support 💬

For issues and questions:
- Open an issue on GitHub
- Contact: aiml34048@gmail.com

---

Made with ❤️ for the deaf and hard-of-hearing community