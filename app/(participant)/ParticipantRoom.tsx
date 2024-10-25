"use client";
import { RoomAudioRenderer, useRemoteParticipants, useRoomContext } from "@livekit/components-react";

export const ParticipantRoom = () => {
  const room = useRoomContext();
  room.localParticipant.setCameraEnabled(true);

  const [agent] = useRemoteParticipants();

  console.log(agent);

  return (
    <div>
      <h1>Participant Room</h1>
      <RoomAudioRenderer />
      <pre>{JSON.stringify(agent, undefined, 2)}</pre>
    </div>
  );
};
