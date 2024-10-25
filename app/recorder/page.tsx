"use client";
import { Suspense, useCallback, useRef, useState } from "react";

const blobToBase64 = (blob: Blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result);
    };
  });
};

export const Recorder = () => {
  const [id, setId] = useState<string | undefined>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunkIdx = useRef(0);

  const startRecording = useCallback(() => {
    setId(Date.now().toString(36).substring(2));
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        blobToBase64(event.data).then((base64) => {
          if (typeof base64 === "string") {
            console.log(
              `Chunk ${chunkIdx.current}:`,
              base64.length,
              `${base64.substring(0, 6)}...${base64.substring(
                base64.length - 6
              )}`
            );
            chunkIdx.current += 1;
          }
        });
      });
      mediaRecorderRef.current.start(500);
    });
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setId(undefined);
    mediaRecorderRef.current = null;
    chunkIdx.current = 0;
  }, []);

  return (
    <div className="container">
      <h1>Recorder</h1>
      <p>
        <code>{id}</code>
      </p>
      {id ? (
        <button className="btn btn-primary" onClick={stopRecording}>
          Stop Recording
        </button>
      ) : (
        <button className="btn btn-primary" onClick={startRecording}>
          Start Recording
        </button>
      )}
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Recorder />
    </Suspense>
  );
}
