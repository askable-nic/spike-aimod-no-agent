import { DeepgramClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

async function getMicrophone() {
  const userMedia = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  return new MediaRecorder(userMedia);
}

export const Deepgram = ({ dgApiKey }: { dgApiKey: string }) => {
  const [dgClient, setDgClient] = useState<DeepgramClient | undefined>();
  const [recordingState, setRecordingState] = useState<
    "idle" | "initialising" | "recording" | "finalising"
  >("idle");
  const activeMic = useRef<MediaRecorder | undefined>();
  const sttInterim = useRef<string>("");
  const sttTranscript = useRef<string>("");
  const sttInterimPreview = useRef<HTMLTextAreaElement>(null);
  const sttTranscriptPreview = useRef<HTMLTextAreaElement>(null);
  const [lastSubmittedMessage, setLastSubmittedMessage] = useState<string>("");

  const sttPreviewInterval = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => {
    setDgClient(new DeepgramClient({ key: dgApiKey }));
  }, [dgApiKey]);

  const updatePreviews = useCallback(() => {
    if (sttInterimPreview.current) {
      sttInterimPreview.current.value = sttInterim.current ?? "";
    }
    if (sttTranscriptPreview.current) {
      sttTranscriptPreview.current.value = sttTranscript.current;
    }
  }, []);

  useEffect(() => {
    sttPreviewInterval.current = setInterval(updatePreviews, 250);
    return () => {
      if (sttPreviewInterval.current) {
        clearInterval(sttPreviewInterval.current);
      }
    };
  }, []);

  function commitStt() {
    if (sttInterim.current) {
      sttTranscript.current += `${sttInterim.current} `;
      sttInterim.current = "";
    }
    return sttTranscript.current;
  }

  const submitTranscript = useCallback(async (transcriptValue: string) => {
    if (!transcriptValue) {
      console.warn("No transcript to submit");
      return false;
    }
    // mock server request
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLastSubmittedMessage(transcriptValue);
  }, []);

  const startRecording = useMemo(
    () => () => {
      if (!dgClient) {
        console.warn("Deepgram client not initialised");
        return;
      }
      setRecordingState("initialising");
      getMicrophone()
        .then((mic) => {
          const dgConnection = dgClient.listen.live({
            model: "nova",
            punctuate: true,
            channels: 1,
            // endpointing: 500,
            interim_results: true,
          });
          dgConnection.on(LiveTranscriptionEvents.Open, () => {
            dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
              sttInterim.current = data?.channel?.alternatives[0]?.transcript;
              if (data.is_final && sttInterim.current) {
                commitStt();
                sttTranscriptPreview.current!.value = sttTranscript.current;
              }
            });
            mic.start(500);
            setRecordingState("recording");
            mic.ondataavailable = (e) => {
              const data = e.data;
              //   console.log("audio data:", data.size);
              dgConnection.send(data);
            };
            activeMic.current = mic;
          });
        })
        .catch((err) => {
          console.error(err);
        });
    },
    [dgClient]
  );

  const stopRecording = useMemo(
    () => () => {
      setRecordingState("finalising");
      if (!activeMic.current) {
        console.warn("No active microphone");
        setRecordingState("idle");
        return;
      }
      activeMic.current.stop();
      activeMic.current.stream.getTracks().forEach((track) => track.stop());
      commitStt();
      sttTranscriptPreview.current!.value = "";
      submitTranscript(sttTranscript.current).finally(() => {
        sttInterim.current = "";
        sttTranscript.current = "";
        setRecordingState("idle");
      });
    },
    [submitTranscript]
  );

  const recordButton = useMemo(() => {
    switch (recordingState) {
      case "idle":
        return (
          <button className="btn btn-primary" onClick={startRecording}>
            Start
          </button>
        );
      case "initialising":
        return (
          <button className="btn" disabled>
            Start
          </button>
        );
      case "recording":
        return (
          <button className="btn btn-secondary" onClick={stopRecording}>
            Stop
          </button>
        );
      case "finalising":
        return (
          <button className="btn" disabled>
            Stop
          </button>
        );
      default:
        return (
          <button className="btn" disabled>
            ...
          </button>
        );
    }
  }, [recordingState, startRecording, stopRecording]);

  return (
    <div className="container my-2 px-2">
      <h1>Deepgram live STT</h1>
      {recordButton}
      <h2>Live STT</h2>
      <h3>Current utterance</h3>
      <textarea
        className="textarea text-sm font-mono! leading-tight textarea-bordered w-full"
        readOnly
        ref={sttInterimPreview}
      />
      <h3>Whole transcript</h3>
      <textarea
        className="textarea text-sm font-mono! leading-tight textarea-bordered w-full"
        readOnly
        ref={sttTranscriptPreview}
      />
      <h2>Submitted message</h2>
      <textarea
        className="textarea text-sm font-mono! leading-tight textarea-bordered w-full"
        readOnly
        value={lastSubmittedMessage}
      />
    </div>
  );
};
