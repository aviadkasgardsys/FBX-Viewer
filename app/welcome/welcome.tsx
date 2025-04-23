import React from "react";
import FbxViewer from "~/components/fbxviewer";
import FbxViewerWithAnimation from "~/components/FbxViewerWithAnimation";

export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div style={{ width: "100%", height: "400px" }}>
        <FbxViewerWithAnimation />
      </div>
    </main>
  );
}
