"use client";
import { RoomWrapper } from "@/components/RoomWrapper";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Deepgram } from "./Deepgram";

const PageRoom = () => {
  const [dgApiKey, setDgApiKey] = useState<string | undefined>();
  const [roomName, setRoomName] = useState<string | undefined>();

  const params = useSearchParams();

  useEffect(() => {
    const [_roomName, _dgApiKey] = [
      params.get("room-name"),
      params.get("dg-api-key"),
    ];
    if (typeof _roomName === "string") {
      setRoomName(_roomName);
    }
    if (typeof _dgApiKey === "string") {
      setDgApiKey(_dgApiKey);
    }
  }, [params]);

  if (dgApiKey && roomName) {
    return (
      <RoomWrapper name={roomName} viewer="participant">
        <Deepgram apiKey={dgApiKey} />
      </RoomWrapper>
    );
  }

  return (
    <form
      className="container max-w-xs mx-auto my-4 flex flex-col space-y-2"
      method="get"
    >
      <input
        type="text"
        className="input input-bordered w-full monospace"
        placeholder="API Key"
        name="dg-api-key"
      />
      <input
        type="text"
        className="input input-bordered w-full monospace"
        placeholder="Room Name"
        name="room-name"
      />
      <button type="submit" className="btn">
        Submit
      </button>
    </form>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageRoom />
    </Suspense>
  );
}
