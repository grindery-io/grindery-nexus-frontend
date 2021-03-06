import React from "react";
import { CircularProgress } from "grindery-ui";
import useAppContext from "../../hooks/useAppContext";
import WorkflowContextProvider from "../../context/WorkflowContext";
import WorkflowSteps from "../workflow/WorkflowSteps";

type Props = {};

const WorkflowBuilderPage = (props: Props) => {
  const { user, connectors } = useAppContext();

  if (!connectors || !connectors.length) {
    return (
      <div style={{ marginTop: 40, textAlign: "center", color: "#8C30F5" }}>
        <CircularProgress color="inherit" />
      </div>
    );
  }

  return (
    <WorkflowContextProvider user={user}>
      <WorkflowSteps />
    </WorkflowContextProvider>
  );
};

export default WorkflowBuilderPage;
