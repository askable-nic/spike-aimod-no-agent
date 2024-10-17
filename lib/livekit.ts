import { LivekitInitResult, ViewerType } from "@/app/api/livekit/init/route";
import ky from "ky";

export async function initLiveKit(roomName: string, viewer: ViewerType) {
  const params = new URLSearchParams();
  params.set("roomName", roomName);
  params.set("viewer", viewer);
  return ky.post(`/api/livekit/init?${params.toString()}`).json<LivekitInitResult>();
}
