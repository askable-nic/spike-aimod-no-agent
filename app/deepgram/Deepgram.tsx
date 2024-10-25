import { DeepgramClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import {
  useLocalParticipant,
  useRoomContext,
  ControlBar,
} from "@livekit/components-react";
import { useEffect, useRef, useState } from "react";

export const Deepgram = ({ apiKey }: { apiKey: string }) => {
  const room = useRoomContext();
  const localParticipant = useLocalParticipant();
  const deepgram = useRef<DeepgramClient>(new DeepgramClient({ key: apiKey }));
  const recorder = useRef<MediaRecorder | undefined>();
  const stt = useRef<string[]>([]);
  const [lastMessage, setLastMessage] = useState<string | undefined>();
  const sttPreviewRef = useRef<HTMLPreElement | null>(null);
  const stopRecordingTimeout = useRef<NodeJS.Timeout | null>(null);

  const [recorderState, setRecorderState] = useState<
    "idle" | "starting" | "recording" | "finalising"
  >("idle");
  const [sttState, setSttState] = useState<"idle" | "listening" | "finalising">(
    "idle"
  );

  const micTrack = localParticipant.microphoneTrack;
  const micStream = micTrack?.audioTrack?.mediaStream;

  useEffect(() => {
    if (micStream) {
      if (localParticipant.isMicrophoneEnabled) {
        if (micStream && deepgram.current) {
          const dgConnection = deepgram.current.listen.live({
            model: "nova",
            punctuate: true,
            channels: 1,
            // endpointing: ENDPOINT_DELAY,
            interim_results: false,
          });

          dgConnection.on(LiveTranscriptionEvents.Open, () => {
            setSttState("listening");
            dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
              const transcript = data?.channel?.alternatives[0]?.transcript;
              if (
                data?.is_final &&
                transcript &&
                typeof transcript === "string"
              ) {
                stt.current.push(transcript);
                if (sttPreviewRef.current) {
                  sttPreviewRef.current.innerText = stt.current.join("\n");
                }
              } else if (transcript) {
                console.log(data, transcript);
              }
            });
            setRecorderState("starting");
            recorder.current = new MediaRecorder(micStream, {});
            recorder.current.ondataavailable = (event) => {
              dgConnection.send(event.data);
            };
            recorder.current.onstart = () => {
              setRecorderState("recording");
            };
            recorder.current.onstop = () => {
              setRecorderState("idle");
            };
            recorder.current.start(250);
          });
        } else {
          throw new Error("Deepgram client not initialized");
        }
      } else {
        if (recorder.current) {
          setRecorderState("finalising");
          setSttState("finalising");
          stopRecordingTimeout.current = setTimeout(() => {
            if (recorder.current) {
              recorder.current.stop();
              recorder.current = undefined;
            }
            setLastMessage(stt.current.join(" "));
            stt.current = [];
            if (sttPreviewRef.current) {
              sttPreviewRef.current.innerText = "";
            }
          }, 1000);
        }
      }
    }
    return () => {
      if (stopRecordingTimeout.current) {
        clearTimeout(stopRecordingTimeout.current);
      }
    };
  }, [localParticipant.isMicrophoneEnabled, micStream]);

  return (
    <div className="container my-2 px-2">
      <h1>Deepgram</h1>
      <h2>Room: {room.state}</h2>
      <h3>Recorder state: {recorderState}</h3>
      <h3>SST state: {sttState}</h3>
      {/* <button onClick={() => { localParticipant.isMicrophoneEnabled }}> */}
      <ControlBar />
      <pre ref={sttPreviewRef} className="text-xs" />
      <blockquote>
        {lastMessage ? (
          <>
            <strong>Sent:</strong>
            <p>{lastMessage}</p>
          </>
        ) : null}
      </blockquote>
    </div>
  );
};
