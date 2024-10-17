"use client";
import { useSearchParams } from "next/navigation";
import { RoomWrapper } from "@/components/RoomWrapper";
import { ParticipantRoom } from "./ParticipantRoom";
import { Suspense } from "react";

const HomePage = () => {
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
      <ParticipantRoom />
    </RoomWrapper>
  );
};

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}
