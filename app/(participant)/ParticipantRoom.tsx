"use client";
import { useRoomContext } from "@livekit/components-react";

export const ParticipantRoom = () => {
  const room = useRoomContext();
  room.localParticipant.setCameraEnabled(true);
  return <h2>Participant room</h2>;
};
