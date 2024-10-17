"use client";
import {
  GridLayout,
  ParticipantTile,
  useTracks,
} from "@livekit/components-react";

export const ObserverRoom = () => {
  const tracks = useTracks();
  console.log(tracks);
  return (
    <GridLayout tracks={tracks}>
      <ParticipantTile />
    </GridLayout>
  );
};
