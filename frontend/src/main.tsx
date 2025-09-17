import React from "react";
import { createRoot } from "react-dom/client";
import { greet } from "@full-stack-js/shared";

function App() {
  return <h1>{greet("Frontend")}</h1>;
}

createRoot(document.getElementById("root")!).render(<App />);
