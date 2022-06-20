import React, { useState } from "react";
import styled from "styled-components";
import { IconButton, InputBox, SwitchInput } from "grindery-ui";
import DataBox from "../shared/DataBox";
import { useAppContext } from "../../context/AppContext";
import { ICONS } from "../../constants";
import { Workflow } from "../../types/Workflow";
import WorkflowBuilder from "../workflow/WorkflowBuilder";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  flex-wrap: nowrap;
  padding: 24px 20px;
  gap: 20px;
`;

const SearchWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 5px;
`;

const SearchInputWrapper = styled.div`
  flex: 1;

  & .MuiBox-root {
    margin-bottom: 0;
  }
  & .MuiOutlinedInput-root {
    margin-top: 0;
  }
`;

const ItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 10px;
`;

const ItemTitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 10px;
`;

const Title = styled.span`
  font-weight: 400;
  font-size: 12px;
  line-height: 150%;
  color: #0b0d17;
`;

const ItemAppsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 4px;
`;

const ItemAppWrapper = styled.div`
  padding: 4px;
  background: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 5px;
`;

const ItemAppIcon = styled.img`
  display: block;
  width: 16px;
  height: 16px;
`;

const ItemActionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: nowrap;
  gap: 10px;
`;

type Props = {};

const Workflows = (props: Props) => {
  const { workflows, workflowOpened, connectors, setWorkflowOpened } =
    useAppContext();
  const items = workflows || [];
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = searchTerm
    ? items.filter(
        (item) =>
          item.title &&
          item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const renderWorkflow = (item: Workflow) => {
    const triggerIcon =
      connectors.find((t) => t.key === item.trigger.connector)?.icon || null;

    const actionsIcons = item.actions
      .map((action) => connectors.find((a) => a.key === action.connector)?.icon)
      .filter((a) => a);

    return (
      <DataBox
        key={item.key}
        size="small"
        LeftComponent={
          <ItemTitleWrapper>
            <ItemAppsWrapper>
              {triggerIcon && (
                <ItemAppWrapper>
                  <ItemAppIcon src={triggerIcon} alt="trigger app icon" />
                </ItemAppWrapper>
              )}

              {actionsIcons.length > 0 &&
                actionsIcons.map((icon: any, i2: number) => (
                  <ItemAppWrapper key={item.key + i2}>
                    <ItemAppIcon src={icon} alt="action app icon" />
                  </ItemAppWrapper>
                ))}
            </ItemAppsWrapper>
            <Title>{item.title}</Title>
          </ItemTitleWrapper>
        }
        RightComponent={
          <ItemActionsWrapper>
            <SwitchInput value={item.state === "on"} onChange={() => {}} />
          </ItemActionsWrapper>
        }
      />
    );
  };

  return !workflowOpened ? (
    <Wrapper>
      <SearchWrapper>
        <SearchInputWrapper>
          <InputBox
            placeholder={"Workflows"}
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            icon="search"
            type="search"
          />
        </SearchInputWrapper>
        <IconButton
          color=""
          onClick={() => {
            setWorkflowOpened(true);
          }}
          icon={ICONS.PLUS}
        />
      </SearchWrapper>
      <ItemsWrapper>{filteredItems.map(renderWorkflow)}</ItemsWrapper>
    </Wrapper>
  ) : (
    <WorkflowBuilder />
  );
};

export default Workflows;
