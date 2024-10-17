import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  AccessToken,
  AccessTokenOptions, VideoGrant
} from "livekit-server-sdk";

const apiKey = process.env.LK_API_KEY;
const apiSecret = process.env.LK_API_SECRET;
const cloudUrl = process.env.LK_SERVER_URL;

// const roomService = new RoomServiceClient(cloudUrl!, apiKey, apiSecret);
// const egressClient = new EgressClient(cloudUrl!, apiKey, apiSecret);

const createToken = (userInfo: AccessTokenOptions, grant: VideoGrant) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.addGrant(grant);
  return at.toJwt();
};

export type LivekitInitResult = {
  identity: string;
  roomName: string;
  accessToken: string;
  serverUrl: string;
};

export type ViewerType = 'participant' | 'observer';

export async function POST(req: NextRequest) {
  const roomName = req.nextUrl.searchParams.get('roomName');
  const viewer = req.nextUrl.searchParams.get('viewer') || undefined as ViewerType | undefined;
  
  if (!roomName) {
    return NextResponse.json(
      {
        error: "Room name is required",
      },
      { status: 400 }
    );
  }

  if (!viewer) {
    return NextResponse.json(
      {
        error: `Invalid viewer type: ${viewer}`,
      },
      { status: 400 }
    );
  }

  const userId = `${viewer}-${crypto.randomUUID()}`;

  if (!apiKey || !apiSecret) {
    return new Response("Video provider server error", { status: 500 });
  }

  // try {
  //   const room = await roomService
  //     .createRoom({ name: roomName })
  //     .catch((err) => {
  //       return NextResponse.json(
  //         {
  //           error: `Failed to start room: ${err?.message ?? "(unknown error)"}`,
  //         },
  //         { status: 500 }
  //       );
  //     });

  //   console.log("Room created", room);
  // } catch (err: unknown) {
  //   const errorMessage = err instanceof Error ? err.message : "(unknown error)";
  //   return NextResponse.json(
  //     {
  //       error: `Failed to start room: ${errorMessage}`,
  //     },
  //     { status: 500 }
  //   );
  // }

  try {
    // Generate user token
    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: viewer === "participant",
      canPublishData: viewer === "participant",
      canSubscribe: true,
    };

    const token = await createToken(
      {
        identity: userId,
        name: viewer,
        ttl: '3h',
      },
      grant
    );

    const tokenResult: LivekitInitResult = {
      identity: userId,
      roomName,
      accessToken: token,
      serverUrl: cloudUrl!,
    };

    return NextResponse.json(tokenResult, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
