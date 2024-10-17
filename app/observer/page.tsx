"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ObserverRoom } from "./ObserverRoom";
import { RoomWrapper } from "@/components/RoomWrapper";

export default function Page() {
  const params = useSearchParams();
  const roomName = params.get("roomName");
  const [roomNameInput, setRoomNameInput] = useState("");
  const router = useRouter();

  if (typeof roomName !== "string") {
    return (
      <div className="container p-2 m-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log(roomNameInput);
            router.push(
              `/observer/?roomName=${roomNameInput.trim().toUpperCase()}`
            );
          }}
        >
          <div className="join w-full">
            <input
              className="input input-bordered join-item grow"
              placeholder="Room code"
              onChange={(e) => setRoomNameInput(e.target.value)}
            />
            <button className="btn btn-primary join-item" type="submit">
              Go
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <RoomWrapper name={roomName} viewer="participant">
      <ObserverRoom name={roomName} />
    </RoomWrapper>
  );
}