import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { RichInput, SelectInput, AutoCompleteInput } from "grindery-ui";
import { Field } from "../../types/Connector";
import useWorkflowContext from "../../hooks/useWorkflowContext";
import useAppContext from "../../hooks/useAppContext";
import { BLOCKCHAINS } from "../../constants";
import { debounce } from "throttle-debounce";
import axios from "axios";
import { jsonrpcObj } from "../../helpers/utils";
import InputFieldError from "../shared/InputFieldError";

const InputWrapper = styled.div`
  width: 100%;
  margin-top: 20px;
  & > .MuiBox-root > .MuiBox-root {
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }
`;

type Props = {
  inputField: Field;
  options: any;
  index: any;
  addressBook: any;
  setAddressBook?: (i: any) => void;
  setActionError: (i: string) => void;
  errors: any;
  setErrors: (a: any) => void;
};

const ActionInputField = ({
  inputField,
  options,
  index,
  addressBook,
  setAddressBook,
  setActionError,
  errors,
  setErrors,
}: Props) => {
  const { user } = useAppContext();
  const {
    updateWorkflow,
    workflow,
    actions,
    setConnectors,
    connectors,
    setLoading,
  } = useWorkflowContext();
  const [valChanged, setValChanged] = useState(false);

  const fieldOptions = inputField.choices?.map((choice) => ({
    value: typeof choice !== "string" ? choice.value : choice,
    label: typeof choice !== "string" ? choice.label : choice,
  }));

  const booleanOptions = [
    {
      value: "true",
      label: "True",
      icon: "",
    },
    { value: "false", label: "False", icon: "" },
  ];

  const workflowValue = (
    workflow.actions[index].input[inputField.key] ||
    inputField.default ||
    ""
  ).toString();

  const error =
    (errors &&
      typeof errors !== "boolean" &&
      errors.length > 0 &&
      errors.find((error: any) => error && error.field === inputField.key) &&
      (
        errors.find((error: any) => error && error.field === inputField.key)
          .message || ""
      ).replace(`'${inputField.key}'`, "")) ||
    false;

  const handleFieldChange = (value: string) => {
    setActionError("");
    setErrors(
      typeof errors !== "boolean"
        ? [
            ...errors.filter(
              (error: any) => error && error.field !== inputField.key
            ),
          ]
        : errors
    );

    let newVal: string | number | boolean | (string | number | boolean)[] =
      value.trim();
    if (
      (inputField.type === "string" && inputField.choices) ||
      inputField.type === "boolean"
    ) {
      newVal = (value || "").trim();
      if (inputField.type === "boolean") {
        newVal = newVal === "true";
      }
    }
    if (inputField.type === "string" && !fieldOptions) {
      newVal = value.trim();
    }
    if (inputField.type === "number" && !fieldOptions) {
      newVal = value ? parseFloat(value) : "";
    }
    if (inputField.list) {
      newVal = [newVal].filter((val) => val);
    }
    updateWorkflow({
      ["actions[" + index + "].input." + inputField.key]: newVal,
    });
    setValChanged(true);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFieldsDefinition = useCallback(
    debounce(1000, () => {
      if (
        (typeof inputField.updateFieldDefinition === "undefined" ||
          inputField.updateFieldDefinition) &&
        actions.current(index)?.operation?.inputFieldProviderUrl
      ) {
        if (workflow) {
          axios
            .post(
              actions.current(index)?.operation?.inputFieldProviderUrl || "",
              jsonrpcObj("grinderyNexusConnectorUpdateFields", {
                key: actions.current(index)?.key,
                fieldData: workflow.actions[index].input,
                credentials: workflow.actions[index].credentials,
              })
            )
            .then((res) => {
              if (res && res.data && res.data.error) {
                console.log(
                  "grinderyNexusConnectorUpdateFields error",
                  res.data.error
                );
              }
              if (res && res.data && res.data.result) {
                setConnectors([
                  ...(connectors || []).map((connector) => {
                    if (
                      connector &&
                      connector.key === actions.actionConnector(index)?.key
                    ) {
                      return {
                        ...connector,
                        actions: [
                          ...(connector.actions || []).map((act) => {
                            if (
                              act.key === actions.current(index)?.key &&
                              act.operation
                            ) {
                              return {
                                ...act,
                                operation: {
                                  ...act.operation,
                                  inputFields:
                                    res.data.result.inputFields ||
                                    act.operation.inputFields,
                                  outputFields:
                                    res.data.result.outputFields ||
                                    act.operation.outputFields ||
                                    [],
                                  sample:
                                    res.data.result.sample ||
                                    act.operation.sample ||
                                    {},
                                },
                              };
                            } else {
                              return act;
                            }
                          }),
                        ],
                      };
                    } else {
                      return connector;
                    }
                  }),
                ]);
              }
              setLoading(false);
            })
            .catch((err) => {
              console.log("grinderyNexusConnectorUpdateFields error", err);
              setLoading(false);
            });
        }
      } else {
        setLoading(false);
      }
      setValChanged(false);
    }),
    []
  );

  const renderField = (field: Field) => {
    switch (field.type) {
      case "boolean":
        return (
          <SelectInput
            label={inputField.label || ""}
            type="default"
            placeholder={inputField.placeholder || ""}
            onChange={handleFieldChange}
            options={booleanOptions}
            value={workflowValue}
            tooltip={inputField.helpText}
            required={!!inputField.required}
            error={error}
          />
        );
      default:
        return inputField.choices ? (
          <AutoCompleteInput
            label={inputField.label || ""}
            size="full"
            placeholder={inputField.placeholder || ""}
            onChange={handleFieldChange}
            options={fieldOptions}
            value={workflowValue}
            tooltip={inputField.helpText}
            required={!!inputField.required}
            error={error}
          />
        ) : inputField.key === "_grinderyChain" ? (
          <AutoCompleteInput
            label={inputField.label || ""}
            size="full"
            placeholder={inputField.placeholder || ""}
            onChange={handleFieldChange}
            options={BLOCKCHAINS}
            value={workflowValue}
            tooltip={inputField.helpText}
            required={!!inputField.required}
            error={error}
          />
        ) : (
          <RichInput
            label={inputField.label || ""}
            placeholder={inputField.placeholder || ""}
            required={!!inputField.required}
            tooltip={inputField.helpText || false}
            options={options}
            onChange={handleFieldChange}
            value={workflowValue}
            user={user}
            hasAddressBook={inputField.type === "address"}
            addressBook={addressBook}
            setAddressBook={setAddressBook}
            error={error}
          />
        );
    }
  };

  useEffect(() => {
    if (valChanged) {
      if (
        (typeof inputField.updateFieldDefinition === "undefined" ||
          inputField.updateFieldDefinition) &&
        actions.current(index)?.operation?.inputFieldProviderUrl
      ) {
        setLoading(true);
        updateFieldsDefinition();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    valChanged,
    updateFieldsDefinition,
    setLoading,
    inputField.updateFieldDefinition,
  ]);

  useEffect(() => {
    if (inputField && inputField.default) {
      handleFieldChange(inputField.default);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputField]);

  return (
    <React.Fragment key={inputField.key}>
      {!!inputField && <InputWrapper>{renderField(inputField)}</InputWrapper>}
    </React.Fragment>
  );
};

export default ActionInputField;
