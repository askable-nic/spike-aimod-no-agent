"use client";
import { useMemo, useRef, useState } from "react";

const AUDIO_BITRATE = 9600;

async function getMicrophone() {
  const userMedia = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  // record mp3 audio compressed for voice (low quality)
  return new MediaRecorder(userMedia, {
    mimeType: "audio/webm;codecs=opus",
    audioBitsPerSecond: AUDIO_BITRATE,
  });
}

type StatsResult = {
  bitrate: number;
  duration: number;
  blobsize: number;
  base64size: number;
};

export const AudioUpload = ({}) => {
  const [recordingState, setRecordingState] = useState<
    "idle" | "initialising" | "recording" | "finalising"
  >("idle");
  const activeMic = useRef<MediaRecorder | undefined>();
  const recordStartTime = useRef<number | undefined>();
  const [audioSrcUrl, setAudioSrcUrl] = useState<string | undefined>();
  const [statsResults, setStatsResults] = useState<StatsResult[]>([]);
//   const [displayTimer, setDisplayTimer] = useState<string | undefined>();
//   const displayTimerInterval = useRef<NodeJS.Timeout | undefined>();
//   const [displayTestDuration, setDisplayTestDuration] = useState<string | undefined>();

  const startRecording = useMemo(
    () => () => {
      setRecordingState("initialising");
      setAudioSrcUrl(undefined);
      getMicrophone()
        .then((mic) => {
          mic.ondataavailable = (event) => {
            const duration = Date.now() - recordStartTime.current!;
            console.log("Data available", event.data, {
              blobsize: event.data.size,
              duration,
            });

            const reader = new FileReader();
            reader.onload = function (e) {
              const srcUrl = (e.target?.result ?? undefined) as
                | string
                | undefined;
              if (srcUrl) {
                console.log("srcUrl", srcUrl);
                setAudioSrcUrl(srcUrl);
                // audioNode.current.play();
                const base64size = srcUrl
                  .replace(/^data:.+base64,/, "")
                  .replace(/=$/g, "").length;
                setStatsResults((prev) => [
                  ...prev,
                  {
                    bitrate: AUDIO_BITRATE,
                    duration,
                    blobsize: event.data.size,
                    base64size,
                  },
                ]);
              } else {
                setAudioSrcUrl(undefined);
              }
            };
            reader.readAsDataURL(event.data);
          };
          mic.start();
          recordStartTime.current = Date.now();
          activeMic.current = mic;
          setRecordingState("recording");
        })
        .catch((err) => {
          console.error(err);
          setRecordingState("idle");
        });
    },
    []
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
      setRecordingState("idle");
    },
    []
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

//   const automateResults = () => {
//     startRecording();
//     const testDuration = Math.random() * 1000 * 60 + 5000;
//     setDisplayTestDuration((testDuration / 1000).toFixed(2));
//     setTimeout(() => {
//       stopRecording();
//       setTimeout(automateResults, 1000);
//     }, testDuration);
//     //   }, 2000);
//   };

//   useEffect(() => {
//     automateResults();
//     displayTimerInterval.current = setInterval(() => {
//       if (recordStartTime.current) {
//         setDisplayTimer(
//           ((Date.now() - recordStartTime.current) / 1000).toFixed(2)
//         );
//       } else {
//         setDisplayTimer(undefined);
//       }
//     }, 250);
//   }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        {recordButton}
        {/* {displayTimer && <div className="ml-4">{displayTimer}s / {displayTestDuration ?? '?'}s</div>} */}
      </div>
      {audioSrcUrl && <audio controls src={audioSrcUrl} />}
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>Bitrate</th>
            <th>Duration</th>
            <th>Blob size</th>
            <th>Base64 size</th>
          </tr>
        </thead>
        <tbody>
          {statsResults.map((result, i) => (
            <tr key={i}>
              <td>{result.bitrate}</td>
              <td>{result.duration}</td>
              <td>{result.blobsize}</td>
              <td>{result.base64size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
