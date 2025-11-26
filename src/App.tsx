import { CreateAgentButton } from "./_agents/create-agent";
import { ViewAgents } from "./_agents/view-agents";
import { UploadFileButton } from "./_parser/upload-file";

function App() {
  return (
    <>
      <div>Hi</div>
      <CreateAgentButton />
      <UploadFileButton />
      <ViewAgents />
    </>
  );
}

export default App;
