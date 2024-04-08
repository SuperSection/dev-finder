"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import { Room } from "@/db/schema";
import {
  Call,
  CallControls,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { generateTokenAction } from "./actions";
import { env } from "@/validators/validateEnv";


const apiKey = env.NEXT_PUBLIC_GET_STREAM_API_KEY;


export function DevFinderVideoRoom({ room }: { room: Room }) {
  const session = useSession();

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);

  useEffect(() => {
    if (!session.data || !room) {
      return;
    }

    const userId = session.data?.user.id;
    const client = new StreamVideoClient({
      apiKey,
      user: { id: userId },
      tokenProvider: async () => await generateTokenAction(),
    });
    setClient(client);

    const call = client.call("default", room.id);
    call.join({ create: true });
    setCall(call);

    return () => {
      call.leave();
      client.disconnectUser();
    };
  }, [session, room]);


  return (
    client &&
    call && (
      <StreamVideo client={client}>
        <StreamTheme>
          <StreamCall call={call}>
            <SpeakerLayout />
            <CallControls />
          </StreamCall>
        </StreamTheme>
      </StreamVideo>
    )
  );
}