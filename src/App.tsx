import { CreateAgentButton } from "./_agents/create-agent";
import { ContainerAssignJudges } from "./_assignments/container-assign-judges";
import { UploadFileButton } from "./_parser/upload-file";

function App() {
  return (
    <>
      <CreateAgentButton />
      <UploadFileButton />
      <ContainerAssignJudges />
    </>
  );
}

export default App;
