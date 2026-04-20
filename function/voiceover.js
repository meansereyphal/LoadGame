import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY 
});

export async function speak(text, voice, isOn) {
  if (!isOn) return;

  let pingInterval = null;

  const config = {
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    config: { response_modalities: ["AUDIO"] }
  };

  let Prompt = `You are a male game show host for a "Would You Rather" game.

    Speak in a deep, fun, energetic tone.
    Keep it exciting and dramatic.

    Ask this question: ${text}`;

  if (voice === "FEMALE") {
    Prompt = `
      You are a female game show host for a "Would You Rather" game.

      Speak in a warm, friendly, energetic tone.
      Make it fun and engaging.

      Ask this question:
      ${text}
    `
  } else {
    Prompt = `You are a male game show host for a "Would You Rather" game.

    Speak in a deep, fun, energetic tone.
    Keep it exciting and dramatic.

    Ask this question: ${text}`;
  }

  const session = await ai.live.connect(config);

  if (session) {
    console.log("Session established with Gemini API");
  }

  session.on('message', (msg) => {
    if (msg.type === 'output_audio') {
      const audio = new Audio(`data:audio/wav;base64,${msg.data}`)
      audio.play();
    }
  })

  session.on('close', () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  })

  await session.ready()

  if (isOn && !pingInterval) {
    pingInterval = setInterval(() => {
      session.send({
        type: "input_text",
        text: "ping"
      })
    }, 30000);
  }

  if (Prompt) {
    await session.send({
      type: 'input_text',
      text: Prompt,
    });
  }

  return {
    stop: () => {
      session.close();
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
    },
    session
  }
}