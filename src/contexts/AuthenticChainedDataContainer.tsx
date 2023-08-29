import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAutonomicIDContext } from "./AutonomicID";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { incrementStep } from "../features/shared/shared-slice";

import { ACDC } from "../types";

interface IContext {
  acdcs: ACDC[];
  handleSelectACDC: (schemaSAID?: string) => Promise<void>;
  getSelectedAcdc: () => ACDC | undefined;
}

export const AuthenticChainedDataContainerContext = createContext<IContext>(
  {} as IContext
);

export function AuthenticChainedDataContainerContextProvider({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  const { client } = useAutonomicIDContext();

  const [acdcs, setAcdcs] = useState<ACDC[]>([]);

  const dispatch = useAppDispatch();
  const aidOption = useAppSelector((state) => state.options.aidOption);
  const acdcOption = useAppSelector((state) => state.options.acdcOption);

  const handleSelectACDC = useCallback(
    async (
      schemaSAID: string = "EEy9PkikFcANV1l7EHukCeXqrzT1hNZjGlUk7wuMO5jw"
    ) => {
      // setModalError("");
      const credentials = client!.credentials();
      const _creds = await credentials.list(aidOption, {
        filter: {
          "-s": {
            $eq: schemaSAID,
          },
        },
      });
      console.log("credential list: ", _creds);
      let saids: ACDC[] = [];
      _creds.forEach((cred: ACDC) => {
        saids.push(cred);
      });

      dispatch(incrementStep());
      setAcdcs(saids);
    },
    [client, aidOption]
  );

  const getSelectedAcdc = useCallback((): ACDC | undefined => {
    const acdc_found = acdcs.find((acdc) => acdc.sad.d === acdcOption);
    if (acdc_found !== undefined) {
      return acdc_found;
    }
    return undefined;
  }, [acdcs, acdcOption]);

  const value = useMemo(
    () => ({
      acdcs,
      handleSelectACDC,
      getSelectedAcdc,
    }),
    [acdcs, handleSelectACDC, getSelectedAcdc]
  );
  return (
    <AuthenticChainedDataContainerContext.Provider
      value={{
        ...value,
      }}
    >
      {children}
    </AuthenticChainedDataContainerContext.Provider>
  );
}
export function useAuthenticChainedDataContainerContext() {
  const context = useContext(AuthenticChainedDataContainerContext);
  if (context === undefined) {
    throw new Error(
      "useAuthenticChainedDataContainerContext must be used within a AuthenticChainedDataContainerContextProvider"
    );
  }
  return context;
}
