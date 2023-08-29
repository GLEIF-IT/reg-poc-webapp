import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SignifyClient, ready } from "signify-ts";

import { AID } from "../types";
import { incrementStep, setStatus } from "../features/shared/shared-slice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { SERVER_URL, SIGNIFY_URL } from "../constants";

interface IContext {
  pending: boolean;
  client: SignifyClient | undefined;
  aids: AID[];
  setClient: any;
  handleCreateAgent: (passcode: string) => Promise<void>;
  getSelectedAid: () => AID | undefined;
}

export const AutonomicIDContext = createContext<IContext>({} as IContext);

export function AutonomicIDContextProvider({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  const [pending, setPending] = useState<boolean>(false);
  const [client, setClient] = useState<SignifyClient | undefined>(undefined);
  const [aids, setAids] = useState<AID[]>([]);

  const aidOption = useAppSelector((state) => state.options.aidOption);

  useEffect(() => {
    ready().then(() => {
      console.log("signify client is ready", SERVER_URL);
    });
  }, [client]);

  const dispatch = useAppDispatch();

  const handleCreateAgent = useCallback(
    async (passcode: string) => {
      // setModalError("");
      try {
        setPending(true);
        dispatch(setStatus("Connecting"));
        const _client = new SignifyClient(SIGNIFY_URL, passcode);
        setClient(_client);
        await connectToAgent(_client);
        const identifiers = _client.identifiers();
        const _ids = await identifiers.list();
        console.log("Identifiers list", _ids);
        setAids(_ids.aids);
        dispatch(incrementStep());
      } catch (error) {
        dispatch(setStatus("Failed"));
        throw new Error("Agent has not been registered ... retry later");
      } finally {
        setPending(false);
      }
    },
    [client]
  );

  const connectToAgent = useCallback(
    async (client: SignifyClient) => {
      try {
        await client.connect();
        await client.state();
      } catch (e) {
        await client.boot();
        await client.connect();
        await client.state();
      }
    },
    [client]
  );

  const getSelectedAid = useCallback((): AID | undefined => {
    const aid_found = aids.find((aid) => aid.name === aidOption);
    if (aid_found !== undefined) {
      return aid_found;
    }
    return undefined;
  }, [aids, aidOption]);

  const value = useMemo(
    () => ({
      pending,
      client,
      aids,
      setClient,
      handleCreateAgent,
      getSelectedAid,
    }),
    [pending, client, aids, setClient, handleCreateAgent, getSelectedAid]
  );

  return (
    <AutonomicIDContext.Provider
      value={{
        ...value,
      }}
    >
      {children}
    </AutonomicIDContext.Provider>
  );
}

export function useAutonomicIDContext() {
  const context = useContext(AutonomicIDContext);
  if (context === undefined) {
    throw new Error(
      "useAutonomicIDContext must be used within a AutonomicIDContextProvider"
    );
  }
  return context;
}