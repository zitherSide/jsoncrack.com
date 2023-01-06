import React, { useState } from "react";
import YAML from "js-yaml";
import { Button } from "src/components/Button";
import { Modal, ModalProps } from "src/components/Modal";
import useConfig from "src/hooks/store/useConfig";
import styled from "styled-components";

const StyledModalContent = styled(Modal.Content)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const StyledUploadWrapper = styled.label`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.BACKGROUND_SECONDARY};
  border: 2px dashed ${({ theme }) => theme.BACKGROUND_TERTIARY};
  border-radius: 5px;
  width: 100%;
  min-height: 200px;
  padding: 16px;
  cursor: pointer;

  input[type="file"] {
    display: none;
  }
`;

const StyledFileName = styled.span`
  color: ${({ theme }) => theme.INTERACTIVE_NORMAL};
`;

const StyledUploadMessage = styled.h3`
  color: ${({ theme }) => theme.INTERACTIVE_ACTIVE};
  margin-bottom: 0;
`;

export const FilterModal: React.FC<ModalProps> = ({ visible, setVisible }) => {
  const setConfig = useConfig(state => state.setConfig);
  const filters = useConfig(state => state.filters);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {};

  const SaveFilter = () => {
    setConfig("filters", YAML.load(filterText));
  };

  const [filterText, setFilterText] = useState(YAML.dump(filters));
  return (
    <Modal visible={visible} setVisible={setVisible}>
      <Modal.Header>Filter Setting</Modal.Header>
      <StyledModalContent>
        <textarea
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          rows={10}
          cols={40}
        />
      </StyledModalContent>
      <Modal.Controls setVisible={setVisible}>
        <Button status="SECONDARY" onClick={SaveFilter}>
          Save
        </Button>
      </Modal.Controls>
    </Modal>
  );
};
