import { createContext, useContext } from "react";

export const DataSyncContext = createContext(null);

export function useDataSync() {
  const context = useContext(DataSyncContext);
  if (!context) throw new Error("useDataSync must be used within a DataSyncProvider");
  return context;
}
