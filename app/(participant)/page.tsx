"use client";
import { useSearchParams } from "next/navigation";
import { RoomWrapper } from "@/components/RoomWrapper";
import { ParticipantRoom } from "./ParticipantRoom";

export default function Home() {
  const params = useSearchParams();
  const roomName = params.get("roomName");

  if (typeof roomName !== "string") {
    return (
      <a
        className="btn btn-lg btn-primary"
        href={`/?roomName=${Math.random()
          .toString(26)
          .substring(2, 8)
          .toUpperCase()}`}
      >
        Join Room
      </a>
    );
  }
  return (
    <RoomWrapper name={roomName} viewer="participant">
      <ParticipantRoom name={roomName} />
    </RoomWrapper>
  );
}
