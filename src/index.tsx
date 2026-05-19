import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
export { default as manifest } from "@/manifest";
export { default as routes } from "@/routes";
