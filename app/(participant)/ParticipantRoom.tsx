"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Track } from "livekit-client";
import { useRoomContext } from "@livekit/components-react";
import CanvasThing from "./CanvasThing";

let constrains = {
  audio: {
    channelCount: { ideal: 1, min: 1 },
    sampleRate: 48000,
    sampleSize: 16,
    volume: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: false,
};

export const ParticipantRoom = () => {
  const room = useRoomContext();
  room.localParticipant.setCameraEnabled(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // const onCanvasLoad = useCallback(() => {
  //   console.log("Canvas loaded");
  //   setCanvasLoaded(true);
  // }, []);

  const onPublishCanvas = useCallback(() => {
    if (!canvasRef.current || room.state !== "connected") {
      console.warn("Not ready to publish canvas");
      return;
    }
    // Create 30fps MediaStream
    const canvasStream = canvasRef.current.captureStream(60);
    room.localParticipant.publishTrack(canvasStream.getVideoTracks()[0], {
      name: "video_from_canvas",
      source: Track.Source.Unknown,
    });
    navigator.mediaDevices.getUserMedia(constrains).then((audioStream) => {
      room.localParticipant.publishTrack(audioStream.getAudioTracks()[0], {
        name: "audio_from_canvas",
        source: Track.Source.Unknown,
      });
    });
    // const publishedTrack = mediaStreamRef.current.getVideoTracks()[0];
    // const publishedTrack = mediaStreamRef.current.getAudioTracks()[0];
    // console.log("Publishing track", publishedTrack, mediaStreamRef.current);
    // room.localParticipant.publishTrack(publishedTrack, {
    //   name: "video_from_canvas",
    //   source: Track.Source.Unknown,
    // });
  }, [room.state, room.localParticipant]);

  return (
    <div>
      <h1>Participant Room</h1>
      <CanvasThing canvasRef={canvasRef} />
      <button className="btn btn-primary" onClick={onPublishCanvas}>
        Publish canvas
      </button>
    </div>
  );
};
