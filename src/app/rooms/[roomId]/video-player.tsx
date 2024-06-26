"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import { Room } from "@/db/schema";
import {
  Call,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { generateTokenAction } from "./actions";


const apiKey = process.env.NEXT_PUBLIC_GET_STREAM_API_KEY!;


export function DevFinderVideoRoom({ room }: { room: Room }) {
  const session = useSession();

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!session.data || !room) {
      return;
    }

    const userId = session.data?.user.id;
    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: userId,
        name: session.data?.user.name ?? undefined,
        image: session.data?.user.image ?? undefined,
       },
      tokenProvider: async () => await generateTokenAction(),
    });
    setClient(client);
    
    const call = client.call("default", room.id);
    call.join({ create: true });
    setCall(call);

    return () => {
      call
        .leave()
        .then(() => client.disconnectUser())
        .catch(console.error);
    };
  }, [session, room]);


  return (
    client &&
    call && (
      <StreamVideo client={client}>
        <StreamTheme>
          <StreamCall call={call}>
            <SpeakerLayout />
            <CallControls
              onLeave={() => {
                router.push("/dev-rooms");
              }}
            />
            <CallParticipantsList onClose={() => undefined} />
          </StreamCall>
        </StreamTheme>
      </StreamVideo>
    )
  );
}
