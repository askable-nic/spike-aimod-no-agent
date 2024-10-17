"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { initLiveKit } from "@/lib/livekit";
import { ViewerType, LivekitInitResult } from "@/app/api/livekit/init/route";

export const RoomWrapper = ({
  children,
  name: roomName,
  viewer,
}: PropsWithChildren<{ name: string; viewer: ViewerType }>) => {
  const [connection, setConnection] = useState<LivekitInitResult | undefined>();

  useEffect(() => {
    initLiveKit(roomName, viewer).then((data) => {
      setConnection(data);
    });
  }, [roomName, viewer]);

  if (connection?.accessToken) {
    console.log(connection);
    return (
      <LiveKitRoom
        token={connection?.accessToken}
        serverUrl={connection?.serverUrl}
        connect
      >
        <h1>ROOM WRAPPER</h1>
        {children}
      </LiveKitRoom>
    );
  }

  return <h1>Loading...</h1>;
};
