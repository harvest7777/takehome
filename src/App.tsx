import { CreateAgentButton } from "./_agents/create-agent";
import { ViewAgents } from "./_agents/view-agents";
import { ContainerAssignJudges } from "./_assignments/container-assign-judges";
import { UploadFileButton } from "./_parser/upload-file";

function App() {
  return (
    <>
      {/* 
      <ViewAgents /> */}
      <CreateAgentButton />
      <UploadFileButton />
      <ContainerAssignJudges />
    </>
  );
}

export default App;
