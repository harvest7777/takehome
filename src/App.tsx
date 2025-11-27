import { CreateAgentButton } from "./_agents/create-agent";
import { ViewAgents } from "./_agents/view-agents";
import { AssignJudges } from "./_assignments/assign-judges";
import { UploadFileButton } from "./_parser/upload-file";

function App() {
  return (
    <>
      {/* <CreateAgentButton />
      <UploadFileButton />
      <ViewAgents /> */}
      <AssignJudges />
    </>
  );
}

export default App;
